
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QAOAParams, VRPProblem, Vehicle, Node, BackendType } from '@/lib/types';
import { generateRandomDistanceMatrix, generateNodeCoordinates } from '@/lib/quantum/qubo';

interface ProblemInputProps {
  onProblemGenerated: (problem: VRPProblem) => void;
  onQAOAParamsChange: (params: QAOAParams) => void;
  isLoading: boolean;
}

const ProblemInput: React.FC<ProblemInputProps> = ({ onProblemGenerated, onQAOAParamsChange, isLoading }) => {
  // Problem parameters
  const [numNodes, setNumNodes] = useState<number>(6);
  const [numVehicles, setNumVehicles] = useState<number>(2);
  
  // QAOA parameters
  const [qaoaParams, setQaoaParams] = useState<QAOAParams>({
    p: 1,
    backend: 'qasm_simulator',
    shots: 1000
  });

  // Update QAOA parameters
  const updateQAOAParams = (updates: Partial<QAOAParams>) => {
    const updatedParams = { ...qaoaParams, ...updates };
    setQaoaParams(updatedParams);
    onQAOAParamsChange(updatedParams);
  };

  // Generate a new random problem
  const generateProblem = () => {
    // Generate random distance matrix
    const distanceMatrix = generateRandomDistanceMatrix(numNodes);
    
    // Generate node coordinates based on the distance matrix
    const nodes = generateNodeCoordinates(distanceMatrix);
    
    // Create vehicles
    const vehicleColors = ["#8B5CF6", "#0EA5E9", "#20E3B2", "#F59E0B", "#EF4444"];
    const vehicles: Vehicle[] = Array(numVehicles).fill(0).map((_, i) => ({
      id: i,
      color: vehicleColors[i % vehicleColors.length]
    }));
    
    const problem: VRPProblem = {
      nodes,
      vehicles,
      distanceMatrix
    };
    
    onProblemGenerated(problem);
  };

  return (
    <Tabs defaultValue="problem" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="problem">Problem Setup</TabsTrigger>
        <TabsTrigger value="quantum">Quantum Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="problem" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Problem Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Number of Nodes</Label>
                <span className="text-sm font-medium">{numNodes}</span>
              </div>
              <Slider
                value={[numNodes]}
                min={3}
                max={15}
                step={1}
                onValueChange={(value) => setNumNodes(value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Number of Vehicles</Label>
                <span className="text-sm font-medium">{numVehicles}</span>
              </div>
              <Slider
                value={[numVehicles]}
                min={1}
                max={5}
                step={1}
                onValueChange={(value) => setNumVehicles(value[0])}
              />
            </div>
            
            <Button 
              className="w-full bg-quantum-teal hover:bg-quantum-teal/90 text-quantum-dark font-medium mt-4"
              onClick={generateProblem}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Generate Random Problem"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="quantum" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">QAOA Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>QAOA Layers (p)</Label>
                <span className="text-sm font-medium">{qaoaParams.p}</span>
              </div>
              <Slider
                value={[qaoaParams.p]}
                min={1}
                max={5}
                step={1}
                onValueChange={(value) => updateQAOAParams({ p: value[0] })}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backend">Quantum Backend</Label>
              <Select
                value={qaoaParams.backend}
                onValueChange={(value) => updateQAOAParams({ backend: value as any })}
                disabled={isLoading}
              >
                <SelectTrigger id="backend">
                  <SelectValue placeholder="Select backend" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qasm_simulator">QASM Simulator</SelectItem>
                  <SelectItem value="aer_simulator">Aer Simulator</SelectItem>
                  <SelectItem value="ibmq_lima">IBM Quantum Lima</SelectItem>
                  <SelectItem value="ibmq_belem">IBM Quantum Belem</SelectItem>
                  <SelectItem value="ibmq_quito">IBM Quantum Quito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shots">Number of Shots</Label>
              <Select
                value={String(qaoaParams.shots)}
                onValueChange={(value) => updateQAOAParams({ shots: parseInt(value) })}
                disabled={isLoading}
              >
                <SelectTrigger id="shots">
                  <SelectValue placeholder="Select shots" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="1000">1,000</SelectItem>
                  <SelectItem value="5000">5,000</SelectItem>
                  <SelectItem value="10000">10,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProblemInput;
