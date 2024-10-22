## Elasticsearch 6.x + GDELT
### Get data into ES, display and filter with Kibana
===
<img src="https://user-images.githubusercontent.com/3126207/35305518-33f26a60-00a2-11e8-991c-c6b465ef7971.png">
===
## Setup
### 1. Install Elastic
Download and Run ElasticSearch 6.x from https://www.elastic.co/downloads/elasticsearch
Download and Run Kibana 6.x from https://www.elastic.co/downloads/kibana

### 2. Set up index mapping
In Kibana dev console: http://localhost:5601/app/kibana#/dev_tools/console?_g=(), set up an index template.
This basically tells elastic that by default, we're not looking to analyze any strings for full text search.

```curl
PUT _template/template_1
{
  "index_patterns": ["*"],
  "settings": {
    "number_of_shards": 1
  },
  "mappings": {
   "_default_": {
       "dynamic_templates": [
           {
               "notanalyzed": {
                   "match": "*",
                   "match_mapping_type": "string",
                   "mapping": {
                       "type": "keyword"
                   }
               }
           }
       ]
   }

  }
}
```

Set up mapping for the GEO & Date
```curl
PUT /elastic_gdelt
{
  "settings" : {
        "index" : {
            "number_of_shards" : 1,
            "number_of_replicas" : 0
        }
    },
   "mappings": {
     "event": {
         "properties": {
             "ActionGeo_Location": {
                 "type": "geo_point"
             },
             "Actor1Geo_Location": {
                 "type": "geo_point"
             },
             "Actor2Geo_Location": {
                 "type": "geo_point"
             },
             "DATEADDED" : {
                 "type":"date",
                     "format": "yyyy-MM-dd"
             }
         }
     }
  }
}
```

I ran into a stupid issue with elastic not allowing me to add data because of low disk space on my local machine.

I set more loose threshholds
```curl
PUT _cluster/settings
{
  "transient": {
    "cluster.routing.allocation.disk.watermark.low": "2gb",
    "cluster.routing.allocation.disk.watermark.high": "1gb",
    "cluster.routing.allocation.disk.watermark.flood_stage": "1gb",
    "cluster.info.update.interval": "1m"
  }
}
```

And apparently it needs a reset. This solves it (https://github.com/elastic/kibana/issues/13685):

```curl
curl -XPUT -H "Content-Type: application/json" https://[YOUR_ELASTICSEARCH_ENDPOINT]:9200/_all/_settings -d '{"index.blocks.read_only_allow_delete": null}'
```

### 3. Add Gdelt data
```
npm install
```

Then download and index the events. It's hardcoded to `20180117` (17 Jan 2018), but can use any date(s) in GDELT.
```
npm run download
```

### 4. Build a cool dashboard with Kibana
I leave this up to you as I didn't have time to properly export the kibana data.
Would be cool to see usage with the elasticsearch graph features and significant terms aggregations.
