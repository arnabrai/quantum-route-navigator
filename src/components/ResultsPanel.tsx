import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VRPProblem, VRPSolution, BackendType } from '@/lib/types';
import { getQAOAMetrics } from '@/lib/quantum/qaoa';
import { Badge } from '@/components/ui/badge';
import RouteComparisonPanel from './RouteComparisonPanel';

interface ResultsPanelProps {
  problem?: VRPProblem;
  quantumSolution?: VRPSolution;
  classicalSolution?: VRPSolution;
  qaoaParams?: { p: number; backend: BackendType; shots: number };
  isLoading: boolean;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ 
  problem, 
  quantumSolution, 
  classicalSolution,
  qaoaParams,
  isLoading 
}) => {
  // Format time in milliseconds
  const formatTime = (ms?: number) => {
    if (!ms) return 'N/A';
    return `${ms.toFixed(2)} ms`;
  };

  // Format distance with 2 decimal places
  const formatDistance = (distance?: number) => {
    if (!distance && distance !== 0) return 'N/A';
    return distance.toFixed(2);
  };

  const formatRouteString = (path: number[]) => {
    return path.join(' → ');
  };

  // Get mock QAOA metrics
  const qaoa = qaoaParams ? getQAOAMetrics(qaoaParams) : null;

  // Loading or no data state
  const renderLoadingOrEmpty = () => (
    <div className="text-center py-12">
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-quantum-teal border-quantum-purple/30 animate-spin"></div>
          </div>
          <p>Computing solution...</p>
        </div>
      ) : (
        <p className="text-muted-foreground">No data available</p>
      )}
    </div>
  );

  if (!problem) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Solution Details</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">Generate a problem to see results</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="comparison" className="h-full">
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="comparison">Comparison</TabsTrigger>
        <TabsTrigger value="routes">Routes</TabsTrigger>
        <TabsTrigger value="quantum">Quantum Metrics</TabsTrigger>
      </TabsList>

      <TabsContent value="comparison" className="h-[calc(100%-40px)]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Performance Comparison</CardTitle>
          </CardHeader>
          <RouteComparisonPanel
            problem={problem}
            quantumSolution={quantumSolution}
            classicalSolution={classicalSolution}
            isLoading={isLoading}
          />
        </Card>
      </TabsContent>

      <TabsContent value="routes" className="h-[calc(100%-40px)]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Route Details</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {(!quantumSolution && !classicalSolution) ? renderLoadingOrEmpty() : (
              <Tabs defaultValue="quantum-routes">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="quantum-routes">Quantum Routes</TabsTrigger>
                  <TabsTrigger value="classical-routes">Classical Routes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="quantum-routes">
                  {quantumSolution ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Path</TableHead>
                          <TableHead className="text-right">Distance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quantumSolution.routes.map((route) => (
                          <TableRow key={route.vehicleId}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: problem.vehicles[route.vehicleId]?.color || '#8B5CF6' }}
                                ></div>
                                <span>Vehicle {route.vehicleId}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {formatRouteString(route.path)}
                            </TableCell>
                            <TableCell className="text-right">{route.distance.toFixed(1)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No quantum solution available</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="classical-routes">
                  {classicalSolution ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Path</TableHead>
                          <TableHead className="text-right">Distance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classicalSolution.routes.map((route) => (
                          <TableRow key={route.vehicleId}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: problem.vehicles[route.vehicleId]?.color || '#0EA5E9' }}
                                ></div>
                                <span>Vehicle {route.vehicleId}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {formatRouteString(route.path)}
                            </TableCell>
                            <TableCell className="text-right">{route.distance.toFixed(1)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No classical solution available</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="quantum" className="h-[calc(100%-40px)]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Quantum Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? renderLoadingOrEmpty() : (
              qaoa ? (
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Energy Levels by QAOA Layer</h3>
                    <div className="h-32 w-full bg-quantum-dark rounded-md p-4 flex items-end space-x-2">
                      {qaoa.energyLevels.map((level, i) => (
                        <div key={i} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-quantum-purple rounded-t" 
                            style={{ height: `${Math.abs(level.energy) * 4}px` }}
                          ></div>
                          <span className="text-xs mt-1">{level.layer}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Layer</span>
                      <span>Energy (lower is better)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Convergence Plot</h3>
                    <div className="h-32 w-full bg-quantum-dark rounded-md p-4 relative">
                      {qaoa.convergence.map((point, i) => {
                        const x = (i / (qaoa.convergence.length - 1)) * 100;
                        const y = 100 - (Math.abs(point.energy) / 10) * 100;
                        const nextPoint = qaoa.convergence[i + 1];
                        
                        if (i === qaoa.convergence.length - 1) {
                          return (
                            <div 
                              key={i}
                              className="absolute w-2 h-2 rounded-full bg-quantum-teal"
                              style={{ left: `${x}%`, top: `${y}%` }}
                            ></div>
                          );
                        }
                        
                        if (nextPoint) {
                          const nextX = ((i + 1) / (qaoa.convergence.length - 1)) * 100;
                          const nextY = 100 - (Math.abs(nextPoint.energy) / 10) * 100;
                          
                          return (
                            <svg
                              key={i}
                              className="absolute left-0 top-0 w-full h-full"
                              style={{ overflow: 'visible' }}
                            >
                              <line
                                x1={`${x}%`}
                                y1={`${y}%`}
                                x2={`${nextX}%`}
                                y2={`${nextY}%`}
                                stroke="#20E3B2"
                                strokeWidth="2"
                              />
                            </svg>
                          );
                        }
                        
                        return null;
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Optimization Iterations</span>
                      <span>Energy</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">State Probability Distribution</h3>
                    <div className="h-32 w-full bg-quantum-dark rounded-md p-4 flex items-end space-x-1">
                      {qaoa.probabilities.map((prob, i) => (
                        <div key={i} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-quantum-blue rounded-t" 
                            style={{ height: `${prob.prob * 100}px` }}
                          ></div>
                          <span className="text-[10px] mt-1 font-mono">{prob.state}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Bit String</span>
                      <span>Probability</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Run a quantum solution to see metrics</p>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ResultsPanel;
