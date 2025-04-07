import { VRPProblem, VRPSolution, Route } from '../types';

/**
 * Solves VRP using a greedy classical algorithm
 * In a production implementation, this would use Google OR-Tools
 * 
 * @param problem The VRP problem
 * @returns The VRP solution
 */
export async function solveVRPClassical(problem: VRPProblem): Promise<VRPSolution> {
  const startTime = performance.now();
  
  const { nodes, vehicles, distanceMatrix } = problem;
  const n = nodes.length;
  const v = vehicles.length;
  
  // Simple greedy algorithm for VRP
  const routes: Route[] = vehicles.map(vehicle => ({
    vehicleId: vehicle.id,
    path: [0], // Start at depot
    distance: 0
  }));
  
  // Assign nodes to vehicles in a greedy manner
  const unassignedNodes = new Set([...Array(n).keys()].slice(1)); // All nodes except depot
  let currentVehicle = 0;
  
  while (unassignedNodes.size > 0) {
    const vehicle = routes[currentVehicle];
    const currentNode = vehicle.path[vehicle.path.length - 1];
    
    // Find closest unassigned node
    let bestNode = -1;
    let bestDistance = Infinity;
    
    for (const node of unassignedNodes) {
      const dist = distanceMatrix[currentNode][node];
      if (dist < bestDistance) {
        bestDistance = dist;
        bestNode = node;
      }
    }
    
    // Assign node to current vehicle
    if (bestNode !== -1) {
      vehicle.path.push(bestNode);
      vehicle.distance += bestDistance;
      unassignedNodes.delete(bestNode);
    }
    
    // Move to next vehicle
    currentVehicle = (currentVehicle + 1) % v;
  }
  
  // Return all vehicles to depot
  for (const vehicle of routes) {
    const lastNode = vehicle.path[vehicle.path.length - 1];
    if (lastNode !== 0) {
      vehicle.path.push(0); // Return to depot
      vehicle.distance += distanceMatrix[lastNode][0];
    }
  }
  
  const totalDistance = routes.reduce((sum, route) => sum + route.distance, 0);
  const executionTime = performance.now() - startTime;
  
  return {
    routes,
    totalDistance,
    executionTime,
    solver: 'classical'
  };
}
