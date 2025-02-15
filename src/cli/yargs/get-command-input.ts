import type { InitCommandInput } from '../commands/init/init.js';
import type { ConnectCommandInput } from '../commands/connect/connect.js';

export interface RdsInstanceOptions {
  rdsInstance: string;
}

export interface RdsClusterOptions {
  rdsCluster: string;
}

export interface CustomTargetVpcOptions {
  customTargetVpc: string;
}

export interface CustomTargetOptions {
  customTargetVpc: string;
  customTargetHost: string;
  customTargetPort: number;
}

export type InitOptions = Partial<RdsInstanceOptions> &
  Partial<RdsClusterOptions> &
  Partial<CustomTargetVpcOptions> & {
    bastionSubnet?: string;
  };

export type ConnectOptions = Partial<RdsInstanceOptions> &
  Partial<RdsClusterOptions> &
  Partial<CustomTargetOptions> & {
    localPort?: number;
  };

export interface CleanupOptions {
  confirm?: boolean;
}

export function getInitCommandInputFromOptions(
  options: InitOptions
): InitCommandInput {
  return {
    target: isRdsInstanceOptions(options)
      ? {
          rdsInstanceId: options.rdsInstance,
        }
      : isRdsClusterOptions(options)
      ? {
          rdsClusterId: options.rdsCluster,
        }
      : isCustomTargetOptions(options)
      ? {
          customTargetVpcId: options.customTargetVpc,
        }
      : undefined,
    bastionSubnet: options.bastionSubnet,
  };
}

export function getConnectCommandInputFromOptions(
  options: ConnectOptions
): ConnectCommandInput {
  return {
    target: isRdsInstanceOptions(options)
      ? {
          rdsInstanceId: options.rdsInstance,
        }
      : isRdsClusterOptions(options)
      ? {
          rdsClusterId: options.rdsCluster,
        }
      : isCustomTargetOptions(options)
      ? {
          customTargetVpcId: options.customTargetVpc,
          customTargetHost: options.customTargetHost,
          customTargetPort: options.customTargetPort,
        }
      : undefined,
    localPort: options.localPort,
  };
}

export function getCleanupCommandInputFromOptions(
  options: CleanupOptions
): CleanupOptions {
  return {
    confirm: options.confirm,
  };
}

function isRdsInstanceOptions(
  options: ConnectOptions | InitOptions
): options is RdsInstanceOptions {
  return 'rdsInstance' in options;
}

function isRdsClusterOptions(
  options: ConnectOptions | InitOptions
): options is RdsClusterOptions {
  return 'rdsCluster' in options;
}

function isCustomTargetOptions(
  options: InitOptions
): options is CustomTargetVpcOptions;
function isCustomTargetOptions(
  options: ConnectOptions
): options is CustomTargetOptions;
function isCustomTargetOptions(options: ConnectOptions | InitOptions): any {
  return 'customTargetVpc' in options;
}
