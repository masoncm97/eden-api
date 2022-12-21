import { v4 as uuidv4 } from "uuid";

export const dummySubmitTask = async (generatorId: string, config: any) => {
  console.log(`Submitting task for generator ${generatorId} with config ${JSON.stringify(config)}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return uuidv4();
};

export const dummyCreate = async (generatorId: string, config: any) => {
  console.log(`Creating task for generator ${generatorId} with config ${JSON.stringify(config)}`);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return uuidv4();
};