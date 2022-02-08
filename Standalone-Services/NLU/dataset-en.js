const datasetEn = {
    "version": "v2",
    "entities": {
      "animal": {
        "open_set": false,
        "values": [
          {
            "value": "hedgehog",
            "synonyms": ["urchin"]
          },
          {
            "value": "racoon",
            "synonyms": ["raccoon", "coon"]
          }
        ],
        "includes": [
          "(hedgehog)[animal]",
          "(hedgehog)[animal] is animal"
        ]
      }
    }
  }
  
  exports.datasetEn = datasetEn;
