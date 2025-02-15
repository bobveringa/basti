import inquirer from 'inquirer';

import { getDbClusters } from '#src/aws/rds/get-db-clusters.js';
import { getDbInstances } from '#src/aws/rds/get-db-instances.js';
import type { AwsDbCluster, AwsDbInstance } from '#src/aws/rds/rds-types.js';
import type { Cli } from '#src/common/cli.js';
import { cli } from '#src/common/cli.js';
import { fmt } from '#src/common/fmt.js';
import type {
  DbClusterTargetInput,
  DbInstanceTargetInput,
} from '#src/target/target-input.js';

import { getErrorDetail } from '../../error/get-error-detail.js';

import type { DistinctChoice } from 'inquirer';

export type AwsTargetInput = DbInstanceTargetInput | DbClusterTargetInput;

export async function promptForAwsTarget(): Promise<
  AwsTargetInput | undefined
> {
  const { instances, clusters } = await getTargets();

  const { target } = await cli.prompt({
    type: 'list',
    name: 'target',
    message: 'Select target to connect to',
    choices: [
      ...toInstanceChoices(instances),
      ...toClusterChoices(clusters),
      ...getCustomChoices(),
    ],
  });

  return target;
}

async function getTargets(): Promise<{
  instances: AwsDbInstance[];
  clusters: AwsDbCluster[];
}> {
  const subCli = cli.createSubInstance({ indent: 2 });

  cli.out(`${fmt.green('❯')} Retrieving connection targets:`);

  const instances = await getTargetResources(
    async () => await getDbInstances(),
    'DB instances',
    subCli
  );

  const clusters = await getTargetResources(
    async () => await getDbClusters(),
    'DB clusters',
    subCli
  );

  return { instances, clusters };
}

function toInstanceChoices(instances: AwsDbInstance[]): DistinctChoice[] {
  if (instances.length === 0) {
    return [];
  }
  return [
    new inquirer.Separator('Database instances:'),
    ...instances.map(instance => toInstanceChoice(instance)),
  ];
}

function toClusterChoices(clusters: AwsDbCluster[]): DistinctChoice[] {
  if (clusters.length === 0) {
    return [];
  }
  return [
    new inquirer.Separator('Database clusters:'),
    ...clusters.map(cluster => toClusterChoice(cluster)),
  ];
}

function getCustomChoices(): DistinctChoice[] {
  return [
    new inquirer.Separator(),
    {
      name: 'Custom',
      value: undefined,
    },
  ];
}

async function getTargetResources<T>(
  getResources: () => Promise<T[]>,
  resourceName: string,
  cli: Cli
): Promise<T[]> {
  try {
    cli.progressStart(resourceName);
    const resources = await getResources();
    cli.progressSuccess();
    return resources;
  } catch (error) {
    const warnText = getErrorDetail(error);

    cli.progressWarn({ warnText });
    return [];
  }
}

function toInstanceChoice(
  dbInstance: AwsDbInstance
): DistinctChoice<DbInstanceTargetInput> {
  return {
    name: dbInstance.identifier,
    value: {
      dbInstance,
    },
  };
}

function toClusterChoice(dbCluster: AwsDbCluster): DistinctChoice {
  return {
    name: dbCluster.identifier,
    value: {
      dbCluster,
    },
  };
}
