#Sticker Cannon
A tool for printing address labels using a DYMO LabelWriter 450 Label Printer

### Environment Variables
The code takes a singular environment variable, `DATABASE_URL` its name is a slight misnomer, because it contains all database authentication information, it should look like the following: 

`postgresql://[USERNAME]:[PASSWORD]@[IP]:[PORT]/[DATABASE]`

Sensible default values for use within CodeDay:

| Name | Value |
| ---- | ----- |
| `USERNAME` | `sticker-cannon` |
|`PASSWORD` | not putting this in the readme |
|`IP` | `postgres-master-pg.service.consul`, if the target machine has `.consul` resolution, if not check nomad for the ip |
|`PORT` | `5432` |
|`DATABASE`|  `sticker-cannon` |

## Usage
### Backend
The backend is an express server that accepts web requests to add labels that need to be printed to a database

It accepts a POST request to the `/send` endpoint with a json body of the following format: (this is designed to work out of the box a CognitoForms webhook)
```json
{
 "Name": {
   "First": "Person's first name",
   "Last": "Person's last name"
 },
  "Address":  {
    "Line1": "123 Testing Street", 
    "Line2": "Apartment 1Q",
    "City": "Florida City", 
    "State": "Florida",
    "PostalCode": "12345",
    "Country": "United States"
  }
}
```
an optional `Metadata` or `EventId` field can also be inlcuded to pass additional information about the address (reccomended)

### Frontend
The frontend, if you can really call it that, is a CLI tool for printing labels from the database

It's usage is simple:
```
node print <cmd> [args]

Commands:
  print test                 Print a test address and return label
  print metadata [metadata]  Print return labels and addresses for all unprinted
                             labels with the given metadata
``` 
for example `node print metadata virtual-codeday-spring-2021` would print all the as-of-yet unprinted labels with the `virtual-codeday-spring-2021` metadata (registrants for Virtual CodeDay Spring 2021)
