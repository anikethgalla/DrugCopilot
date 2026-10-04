from app.ingestion.provenance import ProvenanceFactory

if __name__ == "__main__":
    prov = ProvenanceFactory.chembl("CHEMBL25")
    print(f"Provenance model test: {prov.dict()}")
