## Usage

### Deployment
First, you must have your aws credentials configured.

- Run `npm i` to install the project dependencies
- Run `npx sls deploy` to deploy this stack to AWS

After deploying, you should get the endpoint:

```bash
Deploying lcr-simulator to stage dev (us-west-2)

✔ Service deployed to stack lcr-simulator-dev (47s)

endpoint: POST - https://ht8pjfxqoj.execute-api.us-west-2.amazonaws.com/
functions:
  setData: lcr-simulator-dev-setData (457 kB)
  listToStream: lcr-simulator-dev-listToStream (1.3 kB)
```

### Invocation

After successful deployment, you can call the created application via Rest API Client (like Postman for example):

```
endpoint:
  POST - https://ht8pjfxqoj.execute-api.us-west-2.amazonaws.com/
```

````
body (json) - example:
````
```json
{
    "testCases": [
        "3 LR.CCR.L.RLLLCLR.LL.R...CLR.",
        "5 RL....C.L",
        "0 "
    ]
}
```

Which should result in response similar to the following:

```
Game 1:
Player 1: 0
Player 2: 0
Player 3: 6(W)
Center: 3

Game 2:
Player 1: 1
Player 2: 4
Player 3: 1
Player 4: 4(*)
Player 5: 4
Center: 1
```

```
You can also see the explanation in this video:
https://www.loom.com/share/b2e76474d53341349fda3a1ac6be4639
```
