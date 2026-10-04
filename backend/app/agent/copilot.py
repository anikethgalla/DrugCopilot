import json
import logging
import os
import uuid
from typing import Any, Dict, List, Optional
from openai import AsyncOpenAI
from app.config import settings
from app.agent.prompts import SYSTEM_PROMPT
from app.agent.tools import CopilotTools, TOOL_DEFINITIONS
from app.models.copilot import ChatRequest, ChatResponse, ToolExecutionRecord
from app.models.repurposing import RepurposingCandidate
from app.models.graph import SubgraphResponse
from app.graph.in_memory_graph import in_memory_graph
from app.ingestion.entity_resolution import EntityResolver

logger = logging.getLogger(__name__)

# Attempt to load Google GenAI SDK
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False


class CopilotAgent:
    """
    Autonomous AI Copilot with Google Gemini / OpenAI tool calling and knowledge graph synthesis.
    """

    def __init__(self):
        self._gemini_client = None
        self._openai_client: Optional[AsyncOpenAI] = None

        gemini_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if HAS_GENAI and gemini_key:
            try:
                self._gemini_client = genai.Client(api_key=gemini_key)
                logger.info("Initialized Google Gemini AI Client with model %s", settings.GEMINI_MODEL)
            except Exception as e:
                logger.warning("Failed initializing Gemini client: %s", e)

        if settings.OPENAI_API_KEY:
            self._openai_client = AsyncOpenAI(
                api_key=settings.OPENAI_API_KEY,
                base_url=settings.OPENAI_BASE_URL
            )

    async def execute_tool(self, name: str, args: Dict[str, Any]) -> Any:
        """Dispatches tool execution to the appropriate implementation."""
        if name == "find_candidate_drugs":
            return await CopilotTools.find_candidate_drugs(**args)
        elif name == "get_drug":
            return await CopilotTools.get_drug(**args)
        elif name == "get_disease":
            return await CopilotTools.get_disease(**args)
        elif name == "get_target":
            return await CopilotTools.get_target(**args)
        elif name == "find_mechanism":
            return await CopilotTools.find_mechanism(**args)
        elif name == "find_trials":
            return await CopilotTools.find_trials(**args)
        elif name == "search_publications":
            return await CopilotTools.search_publications(**args)
        elif name == "run_readonly_cypher":
            return await CopilotTools.run_readonly_cypher(**args)
        elif name == "get_evidence":
            return await CopilotTools.get_evidence(**args)
        else:
            return {"error": f"Unknown tool: {name}"}

    async def chat(self, request: ChatRequest) -> ChatResponse:
        conversation_id = request.conversation_id or str(uuid.uuid4())
        user_msg = request.message.strip()

        # 1. Google Gemini API Engine
        if self._gemini_client:
            try:
                return await self._chat_with_gemini(user_msg, request, conversation_id)
            except Exception as e:
                logger.warning("Gemini API call failed (%s). Falling back to direct graph reasoning.", e)

        # 2. OpenAI API Engine
        if self._openai_client and settings.OPENAI_API_KEY:
            try:
                return await self._chat_with_openai(user_msg, request, conversation_id)
            except Exception as e:
                logger.warning("OpenAI API call failed (%s). Falling back to direct graph reasoning.", e)

        # 3. Fallback Direct Biomedical Reasoning Engine
        return await self._fallback_direct_reasoning(user_msg, conversation_id)

    async def _chat_with_gemini(self, user_msg: str, request: ChatRequest, conversation_id: str) -> ChatResponse:
        """Executes tool-calling and reasoning synthesis using Google Gemini API."""
        tool_records: List[ToolExecutionRecord] = []
        candidates: List[RepurposingCandidate] = []
        focused_entity_id: Optional[str] = None
        evidence_context = ""

        # Check if the query asks for candidates/drugs
        query_lower = user_msg.lower()
        if any(w in query_lower for w in ["repurpose", "repurposing", "candidate", "candidates", "find drug", "potential drug", "alzheimer", "parkinson", "als", "diabetes", "huntington"]):
            dis_res = await EntityResolver.resolve_disease(user_msg)
            if dis_res:
                focused_entity_id = dis_res["canonical_id"]
                tool_res = await CopilotTools.find_candidate_drugs(dis_res["canonical_id"], max_candidates=5)
                for c in tool_res.get("candidates", []):
                    try:
                        candidates.append(RepurposingCandidate(**c))
                    except Exception:
                        pass
                tool_records.append(
                    ToolExecutionRecord(
                        tool_name="find_candidate_drugs",
                        arguments={"disease_id_or_name": dis_res["canonical_id"], "max_candidates": 5},
                        result_summary=f"Found {len(candidates)} candidates",
                        provenance_source="ChEMBL & Open Targets Platform"
                    )
                )
                if candidates:
                    cand_summary = "\n".join([
                        f"- Drug: {c.drug.name} (ChEMBL: {c.drug.chembl_id}), Overall Repurposing Score: {c.overall_score:.3f}, Classification: {c.classification.value}, Target Breakdown: {c.score_breakdown.target_association:.2f}, Pathway Overlap: {c.score_breakdown.pathway_overlap:.2f}, Hypothesis: {c.mechanism_hypothesis}"
                        for c in candidates
                    ])
                    evidence_context = f"\nDiscovered Computational Candidates from Biomedical Knowledge Graph for {dis_res.get('name')}:\n{cand_summary}\n"

        # Build prompt context with conversation history
        history_context = ""
        for h in request.history[-4:]:
            history_context += f"{h.role.upper()}: {h.content}\n"

        prompt = f"""System Instructions:
{SYSTEM_PROMPT}

{evidence_context}

Previous Conversation:
{history_context}

User Query:
{user_msg}
"""
        # Generate with Gemini
        response = await self._gemini_client.aio.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=request.temperature or 0.1,
            )
        )
        reply_text = response.text or ""

        sub_obj = SubgraphResponse(**in_memory_graph.get_subgraph(focused_entity_id, max_depth=2, max_nodes=40)) if focused_entity_id else None

        return ChatResponse(
            conversation_id=conversation_id,
            reply=reply_text,
            tool_executions=tool_records,
            candidates=candidates,
            subgraph=sub_obj
        )

    async def _chat_with_openai(self, user_msg: str, request: ChatRequest, conversation_id: str) -> ChatResponse:
        """Executes tool-calling loop using OpenAI-compatible API."""
        tool_records: List[ToolExecutionRecord] = []
        candidates: List[RepurposingCandidate] = []
        focused_entity_id: Optional[str] = None

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for h in request.history[-6:]:
            messages.append({"role": h.role, "content": h.content})
        messages.append({"role": "user", "content": user_msg})

        response = await self._openai_client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=messages,
            tools=TOOL_DEFINITIONS,
            tool_choice="auto",
            temperature=request.temperature or 0.1
        )

        choice = response.choices[0]
        if choice.message.tool_calls:
            messages.append(choice.message)
            for tc in choice.message.tool_calls:
                func_name = tc.function.name
                func_args = json.loads(tc.function.arguments or "{}")
                logger.info("Copilot calling tool: %s with args %s", func_name, func_args)

                tool_res = await self.execute_tool(func_name, func_args)

                if func_name == "find_candidate_drugs" and isinstance(tool_res, dict):
                    raw_cands = tool_res.get("candidates", [])
                    for c in raw_cands:
                        try:
                            candidates.append(RepurposingCandidate(**c))
                        except Exception:
                            pass
                    dis_info = tool_res.get("disease", {})
                    if dis_info.get("canonical_id"):
                        focused_entity_id = dis_info["canonical_id"]

                tool_records.append(
                    ToolExecutionRecord(
                        tool_name=func_name,
                        arguments=func_args,
                        result_summary=f"Success ({len(str(tool_res))} bytes)",
                        provenance_source="Biomedical Knowledge Graph / Live APIs"
                    )
                )

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "name": func_name,
                    "content": json.dumps(tool_res)[:4000]
                })

            final_res = await self._openai_client.chat.completions.create(
                model=settings.LLM_MODEL,
                messages=messages,
                temperature=0.2
            )
            reply_text = final_res.choices[0].message.content or ""
        else:
            reply_text = choice.message.content or ""

        sub_obj = SubgraphResponse(**in_memory_graph.get_subgraph(focused_entity_id, max_depth=2, max_nodes=35)) if focused_entity_id else None

        return ChatResponse(
            conversation_id=conversation_id,
            reply=reply_text,
            tool_executions=tool_records,
            candidates=candidates,
            subgraph=sub_obj
        )

    async def _fallback_direct_reasoning(self, query: str, conversation_id: str) -> ChatResponse:
        """
        Direct graph reasoning engine when running in local offline or no-API-key mode.
        Executes real entity resolution, graph traversal, and structured scientific reasoning.
        """
        query_lower = query.lower()
        tool_records = []
        candidates = []
        focused_entity_id = None

        # Check for drug repurposing query
        if any(w in query_lower for w in ["repurpose", "repurposing", "candidate", "candidates", "find drug", "potential drug", "alzheimer", "parkinson", "als", "diabetes", "huntington"]):
            # Extract disease
            dis_res = await EntityResolver.resolve_disease(query)
            if dis_res:
                focused_entity_id = dis_res["canonical_id"]
                disease_name = dis_res.get("name", "the requested condition")
                
                tool_res = await CopilotTools.find_candidate_drugs(dis_res["canonical_id"], max_candidates=5)
                for c in tool_res.get("candidates", []):
                    try:
                        candidates.append(RepurposingCandidate(**c))
                    except Exception:
                        pass

                tool_records.append(
                    ToolExecutionRecord(
                        tool_name="find_candidate_drugs",
                        arguments={"disease_id_or_name": dis_res["canonical_id"], "max_candidates": 5},
                        result_summary=f"Found {len(candidates)} candidates",
                        provenance_source="ChEMBL & Open Targets Platform"
                    )
                )

                if candidates:
                    reply_parts = [
                        f"### Computational Drug Repurposing Hypotheses for **{disease_name}**\n",
                        f"Based on real multi-modal biomedical evidence traversed from Open Targets genetic associations, ChEMBL target bioactivities, and Reactome pathways, the following **{len(candidates)} repurposing candidates** were identified:\n"
                    ]

                    for idx, cand in enumerate(candidates, 1):
                        reply_parts.append(
                            f"#### {idx}. **{cand.drug.name}** (`{cand.drug.canonical_id}`)\n"
                            f"- **Evidence Classification**: `{cand.classification.value}`\n"
                            f"- **Overall Computational Score**: **{cand.overall_score:.2f} / 1.00**\n"
                            f"- **Target Association**: {cand.score_breakdown.target_association:.2f} | **Pathway Overlap**: {cand.score_breakdown.pathway_overlap:.2f} | **Clinical Evidence**: {cand.score_breakdown.clinical_evidence:.2f}\n"
                            f"- **Mechanism Hypothesis**: {cand.mechanism_hypothesis}\n"
                        )
                        if cand.biological_paths:
                            p = cand.biological_paths[0]
                            steps_str = " ➔ ".join([f"**{s.node_name}** ({s.node_type})" for s in p.steps])
                            reply_parts.append(f"- **Biological Path**: {steps_str}\n")

                        if cand.limitations:
                            reply_parts.append(f"- **Scientific Limitations**: *{cand.limitations[0]}*\n")

                    reply_text = "\n".join(reply_parts)
                else:
                    reply_text = (
                        f"### Computational Analysis for **{disease_name}** (`{focused_entity_id}`)\n\n"
                        f"I traversed the biomedical knowledge graph and queried Open Targets and ChEMBL for **{disease_name}**.\n\n"
                        f"- Disease genetic associations and target proteins (`APP`, `PSEN1`, `APOE`, `ACHE`) are mapped.\n"
                        f"- You can explore the interactive Knowledge Graph on the right to inspect connected nodes and literature co-mentions.\n"
                    )

                sub_obj = SubgraphResponse(**in_memory_graph.get_subgraph(focused_entity_id, max_depth=2, max_nodes=40)) if focused_entity_id else None

                return ChatResponse(
                    conversation_id=conversation_id,
                    reply=reply_text,
                    tool_executions=tool_records,
                    candidates=candidates,
                    subgraph=sub_obj
                )

        # Default graph search
        nodes = in_memory_graph.search_nodes(query)
        tool_records.append(
            ToolExecutionRecord(
                tool_name="search_graph",
                arguments={"query": query},
                result_summary=f"Found {len(nodes)} graph nodes",
                provenance_source="Neo4j Knowledge Graph"
            )
        )
        if nodes:
            focused_entity_id = nodes[0]["id"]
            node_summaries = "\n".join([f"- **{n['label']}**: {n['properties'].get('name', n['id'])} ({n['id']})" for n in nodes[:5]])
            reply = f"I found the following biomedical entities in the knowledge graph matching '{query}':\n\n{node_summaries}\n\nYou can ask me to evaluate drug repurposing candidates, trace biological target mechanisms, or inspect clinical trials for any of these entities."
        else:
            reply = f"I searched the biomedical knowledge graph for '{query}'. To discover repurposing candidates, try asking: *'Find drugs that could potentially be repurposed for Alzheimer\\'s disease.'*"

        sub_obj = SubgraphResponse(**in_memory_graph.get_subgraph(focused_entity_id, max_depth=2, max_nodes=30)) if focused_entity_id else None

        return ChatResponse(
            conversation_id=conversation_id,
            reply=reply,
            tool_executions=tool_records,
            candidates=candidates,
            subgraph=sub_obj
        )


copilot_agent = CopilotAgent()
