import { formatJSONResponse } from "@libs/apiGateway";
import { dynamo } from "@libs/dynamo";
import { APIGatewayProxyEvent } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { InputCase } from '@models/input';
import { OuputParams, UpdateChipsParams } from '@models/output';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const body = JSON.parse(event.body);
    const tableName = process.env.myTable;
    console.log('body: ', body);

    const outputData = await generateLCR(body.testCases);

    const data = {
      output: outputData,
      id: uuid(),
    };
    await dynamo.write(data, tableName);

    return outputData;
    /*
    return formatJSONResponse({
      data: {
        message: `data is saved`,
        id: data.id,
        output: outputData,
      },
    });
    */
  } catch (error) {
    console.log("error", error);
    return formatJSONResponse({
      statusCode: 502,
      data: {
        message: error.message,
      },
    });
  }
};

const generateLCR = async (testCases: any) => {
  const cases = await getInputCase(testCases);
  const output = await getOutput(cases);

  return output;
}

const getInputCase = async (testCases: string[]) => {
  let result: InputCase[] = [];

  for (let i = 0; i < testCases.length; i++) {
    const element = testCases[i];
    const splitted = element.split(' ');
    const object: InputCase = {
      numberOfPlayers: +splitted[0],
      diceRolls: splitted[1]
    }
    result.push(object);
  }

  return result;
}

const getOutput = async (cases: InputCase[]) => {
  let result = '';
  let gameCounter = 0;
  cases.forEach((element: InputCase) => {
    let center = 0;
    let playerIDWithoutTurn = -1;
    gameCounter++;

    if (element.numberOfPlayers > 0) {
      let diceRolls = element.diceRolls;

      // initializing chips
      let chipsPerPlayer: number[] = [];
      for (let i = 0; i < element.numberOfPlayers; i++) {
        chipsPerPlayer.push(3);
      }

      let haveWinner = false;
      let playerID = 0;

      // evaluate if there is a winner to continue
      do {
        const chipsCompare = chipsPerPlayer[playerID] > 3 ? 3 : chipsPerPlayer[playerID];
        const diceRoll = getDiceRoll(diceRolls, chipsCompare);
        playerIDWithoutTurn = chipsCompare > diceRoll.length ? playerID : -1;

        /*
        evaluate if the player has chips to continue his turn 
        and if there are not enough dice rolls left to complete a turn
        */
        if (chipsPerPlayer[playerID] > 0 && playerIDWithoutTurn === -1) {
          diceRolls = updateDiceRolls(diceRolls, chipsCompare);
          const updateChipsParams: UpdateChipsParams = {
            diceRoll,
            chipsPerPlayer,
            playerID,
            numberOfPlayers: chipsPerPlayer.length
          }
          const chipsData = updateChips(updateChipsParams);
          chipsPerPlayer = chipsData.chipsPerPlayer;
          center += chipsData.center;
        }

        if (element.numberOfPlayers - 1 === playerID) {
          playerID = 0;
        } else {
          playerID++;
        }

        haveWinner = getWinner(chipsPerPlayer);
      } while (
        !haveWinner
        && playerID < chipsPerPlayer.length
        && playerIDWithoutTurn === -1)

      const outputParams: OuputParams = {
        gameCounter,
        center,
        chipsPerPlayer,
        haveWinner,
        playerIDWithoutTurn
      }
      result += getOutputText(outputParams);
    }

  });

  return result;
}

const getDiceRoll = (diceRolls: string, chips: number) => {
  return diceRolls.substring(0, chips);
}

const updateDiceRolls = (diceRolls: string, chips: number) => {
  return diceRolls.substring(chips);
}

const updateChips = ({ diceRoll, chipsPerPlayer, playerID, numberOfPlayers }: UpdateChipsParams) => {
  let center = 0;
  const dices = diceRoll.split('');

  dices.forEach((dice) => {
    switch (dice) {
      case 'L':
        if (playerID === numberOfPlayers - 1) {
          chipsPerPlayer[0] += 1;
        } else {
          chipsPerPlayer[playerID + 1] += 1;
        }
        chipsPerPlayer[playerID] -= 1;
        break;
      case 'R':
        if (playerID !== 0) {
          chipsPerPlayer[playerID - 1] += 1;
        } else {
          chipsPerPlayer[numberOfPlayers - 1] += 1;
        }
        chipsPerPlayer[playerID] -= 1;
        break;
      case 'C':
        center += 1;
        chipsPerPlayer[playerID] -= 1;
      default:
        break;
    }
  });

  const obj = {
    chipsPerPlayer,
    center
  }

  return obj;
}

const getWinner = (chipsPerPlayer: number[]) => {
  let counter = 0;
  for (let i = 0; i < chipsPerPlayer.length; i++) {
    counter = chipsPerPlayer[i] === 0 ? counter + 1 : counter;
  }

  return chipsPerPlayer.length - 1 === counter;
}

const getOutputText = ({ gameCounter, center, chipsPerPlayer, haveWinner, playerIDWithoutTurn }: OuputParams) => {
  let playerIDWinner = -1;
  let result = '';

  if (haveWinner) {
    playerIDWinner = chipsPerPlayer.findIndex(p => p > 0);
  }

  result += `Game ${gameCounter}:\n`;
  for (let i = 0; i < chipsPerPlayer.length; i++) {
    result += `Player ${i + 1}:${chipsPerPlayer[i]}`;
    result += playerIDWinner === i ? '(W)' : '';
    result += playerIDWithoutTurn === i ? '(*)' : '';
    result += '\n'
  }
  result += `Center:${center}\n\n`;

  return result;
}
