
import { DistanceMatrix, QuboMatrix, VRPProblem, Route, Node } from '../types';

/**
 * Converts a Vehicle Routing Problem into a QUBO matrix
 * 
 * The QUBO formulation uses binary variables x_{i,j,v} where:
 * - i is the starting node
 * - j is the ending node
 * - v is the vehicle
 * 
 * The objective is to minimize the total distance traveled
 * Subject to constraints:
 * - Each node must be visited exactly once
 * - Each vehicle must form a valid route (continuity)
 * 
 * @param problem The VRP problem definition
 * @param penalty The penalty coefficient for constraints
 * @returns The QUBO matrix
 */
export function vrpToQubo(problem: VRPProblem, penalty: number = 10.0): QuboMatrix {
  const { nodes, vehicles, distanceMatrix } = problem;
  const n = nodes.length;
  const v = vehicles.length;
  
  // The total number of binary variables is n^2 * v
  const numVars = n * n * v;
  
  // Initialize QUBO matrix with zeros
  const Q: QuboMatrix = Array(numVars).fill(0).map(() => Array(numVars).fill(0));
  
  // Map (i,j,v) to a linear index
  const index = (i: number, j: number, veh: number) => {
    return i * n * v + j * v + veh;
  };
  
  // 1. Objective function: Minimize total distance
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        const distance = distanceMatrix[i][j];
        for (let veh = 0; veh < v; veh++) {
          const idx = index(i, j, veh);
          Q[idx][idx] += distance;
        }
      }
    }
  }
  
  // 2. Constraint: Each node must be visited exactly once (as destination)
  for (let j = 0; j < n; j++) {
    // Skip depot for this constraint
    if (j === 0) continue;
    
    // Add penalty for each pair of variables that would violate this constraint
    for (let i1 = 0; i1 < n; i1++) {
      for (let v1 = 0; v1 < v; v1++) {
        const idx1 = index(i1, j, v1);
        
        // Linear term to enforce sum = 1
        Q[idx1][idx1] += penalty * (1 - 2);
        
        // Quadratic terms to enforce sum = 1
        for (let i2 = 0; i2 < n; i2++) {
          for (let v2 = 0; v2 < v; v2++) {
            if (i1 === i2 && v1 === v2) continue;
            const idx2 = index(i2, j, v2);
            Q[idx1][idx2] += penalty * 2;
          }
        }
      }
    }
  }
  
  // 3. Constraint: Each node must be visited exactly once (as source)
  for (let i = 0; i < n; i++) {
    // Skip depot for this constraint
    if (i === 0) continue;
    
    // Add penalty for each pair of variables that would violate this constraint
    for (let j1 = 0; j1 < n; j1++) {
      for (let v1 = 0; v1 < v; v1++) {
        if (i === j1) continue;
        const idx1 = index(i, j1, v1);
        
        // Linear term to enforce sum = 1
        Q[idx1][idx1] += penalty * (1 - 2);
        
        // Quadratic terms to enforce sum = 1
        for (let j2 = 0; j2 < n; j2++) {
          for (let v2 = 0; v2 < v; v2++) {
            if (j1 === j2 && v1 === v2) continue;
            if (i === j2) continue;
            const idx2 = index(i, j2, v2);
            Q[idx1][idx2] += penalty * 2;
          }
        }
      }
    }
  }
  
  // 4. Constraint: Route continuity
  for (let k = 0; k < n; k++) {
    if (k === 0) continue;  // Skip depot
    
    for (let veh = 0; veh < v; veh++) {
      // For each non-depot node k and vehicle veh
      // Sum of incoming edges must equal sum of outgoing edges
      
      for (let i = 0; i < n; i++) {
        if (i === k) continue;
        const in_idx = index(i, k, veh);
        
        for (let j = 0; j < n; j++) {
          if (j === k) continue;
          const out_idx = index(k, j, veh);
          
          // Linear terms
          Q[in_idx][in_idx] += penalty;
          Q[out_idx][out_idx] += penalty;
          
          // Cross-terms (negative to cancel when both are 1)
          Q[in_idx][out_idx] -= penalty * 2;
        }
      }
    }
  }
  
  return Q;
}

/**
 * Encodes a solution vector back into vehicle routes
 * 
 * @param solution Binary solution vector
 * @param problem The original VRP problem
 * @returns Array of routes, one for each vehicle
 */
export function decodeSolution(solution: number[], problem: VRPProblem): Route[] {
  const { nodes, vehicles } = problem;
  const n = nodes.length;
  const v = vehicles.length;
  
  const routes: Route[] = [];
  
  // Initialize empty routes for each vehicle
  for (let veh = 0; veh < v; veh++) {
    routes.push({
      vehicleId: vehicles[veh].id,
      path: [0], // All routes start at depot (node 0)
      distance: 0
    });
  }
  
  // Extract routes from solution vector
  const index = (i: number, j: number, veh: number) => i * n * v + j * v + veh;
  
  // Build routes by following the binary solution
  for (let veh = 0; veh < v; veh++) {
    let currentNode = 0; // Start at depot
    let visitedNodes = new Set([0]);
    
    while (visitedNodes.size < n) {
      let nextNode = -1;
      
      // Find the next node for this vehicle
      for (let j = 0; j < n; j++) {
        if (!visitedNodes.has(j)) {
          const idx = index(currentNode, j, veh);
          if (solution[idx] === 1) {
            nextNode = j;
            break;
          }
        }
      }
      
      // No more nodes for this vehicle
      if (nextNode === -1) break;
      
      routes[veh].path.push(nextNode);
      routes[veh].distance += problem.distanceMatrix[currentNode][nextNode];
      visitedNodes.add(nextNode);
      currentNode = nextNode;
    }
    
    // Return to depot to complete the route
    if (routes[veh].path.length > 1) {
      const lastNode = routes[veh].path[routes[veh].path.length - 1];
      routes[veh].path.push(0);
      routes[veh].distance += problem.distanceMatrix[lastNode][0];
    }
  }
  
  return routes.filter(route => route.path.length > 2); // Filter out unused vehicles
}

/**
 * Generate a random symmetric distance matrix
 * 
 * @param numNodes Number of nodes
 * @param maxDistance Maximum distance between nodes
 * @returns A symmetric distance matrix
 */
export function generateRandomDistanceMatrix(numNodes: number, maxDistance: number = 100): DistanceMatrix {
  const matrix: DistanceMatrix = [];
  
  // Initialize matrix with zeros
  for (let i = 0; i < numNodes; i++) {
    matrix.push(Array(numNodes).fill(0));
  }
  
  // Fill upper triangle with random distances
  for (let i = 0; i < numNodes; i++) {
    for (let j = i + 1; j < numNodes; j++) {
      const distance = Math.floor(Math.random() * maxDistance) + 1;
      matrix[i][j] = distance;
      matrix[j][i] = distance; // Symmetry
    }
  }
  
  return matrix;
}

/**
 * Generate node coordinates from a distance matrix using MDS
 * This is a simplified version that works for visualization
 * 
 * @param distanceMatrix The distance matrix
 * @returns Array of nodes with x,y coordinates
 */
export function generateNodeCoordinates(distanceMatrix: DistanceMatrix): Node[] {
  const n = distanceMatrix.length;
  const nodes: Node[] = [];
  
  // Simple approach: place nodes in a circle
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n;
    const radius = 100;
    
    nodes.push({
      id: i,
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      label: i === 0 ? 'Depot' : `Node ${i}`
    });
  }
  
  return nodes;
}
