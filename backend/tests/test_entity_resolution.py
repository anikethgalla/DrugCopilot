import pytest
from app.ingestion.entity_resolution import EntityResolver


@pytest.mark.asyncio
async def test_canonical_disease_resolution():
    res = await EntityResolver.resolve_disease("Alzheimer's disease")
    assert res is not None
    assert res["canonical_id"] == "EFO_0000249"
    assert "Alzheimer" in res["name"]

    res_park = await EntityResolver.resolve_disease("Parkinson's")
    assert res_park is not None
    assert res_park["canonical_id"] == "EFO_0002507"


@pytest.mark.asyncio
async def test_canonical_drug_resolution():
    res = await EntityResolver.resolve_drug("Donepezil")
    assert res is not None
    assert "Donepezil" in res["name"] or "CHEMBL" in res["canonical_id"]
