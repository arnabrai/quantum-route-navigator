
export type Node = {
  id: number;
  x: number;
  y: number;
  label?: string;
};

export type Vehicle = {
  id: number;
  capacity?: number;
  color: string;
};

export type Route = {
  vehicleId: number;
  path: number[];
  distance: number;
};

export type DistanceMatrix = number[][];

export type QuboMatrix = number[][];

export type VRPProblem = {
  nodes: Node[];
  vehicles: Vehicle[];
  distanceMatrix: DistanceMatrix;
};

export type VRPSolution = {
  routes: Route[];
  totalDistance: number;
  executionTime: number;
  solver: 'quantum' | 'classical';
};

export type BackendType = 'qasm_simulator' | 'aer_simulator' | 'ibmq_lima' | 'ibmq_belem' | 'ibmq_quito';

export type QAOAParams = {
  p: number; // Number of QAOA layers
  backend: BackendType;
  shots: number;
};
