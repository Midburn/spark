# Camps API


## Retrieve Camps

Retrieve currently  

#### Endpoint

    GET /camps?some-param={someParam}

#### URL Parameters

  some-param: some parameter that identifies...
  
#### Response

```json
    "camps": {
        "campId": "111222", 
        "campName": "my camp" 
    }
```
    
#### Authentication

Requires a valid Spark session cookie (sparkSession)    

#### Example
    
  `http://www.midburn.org/spark/camps?some-param=00000000-0000-0000-0000-000000000000`





## Add Camp

Adds a new camp

#### Endpoint

    PUT /camps?some-param={someParam}

#### URL Parameters

  some-param: some parameter that identifies...
  
#### Request Body

```json
    {
      "data": {
        "code": "en"       
      }
    }

```
    
#### Authentication

Requires a valid Spark session cookie (sparkSession)    

#### Example
    
  `http://www.midburn.org/spark/camps?some-param=00000000-0000-0000-0000-000000000000`

#### Response
    200 - OK
    400 - Invalid camp
