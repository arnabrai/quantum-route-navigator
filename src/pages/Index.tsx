
import React, { useState } from 'react';
import Header from '@/components/Header';
import ProblemInput from '@/components/ProblemInput';
import RouteVisualization from '@/components/RouteVisualization';
import ResultsPanel from '@/components/ResultsPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { QAOAParams, VRPProblem, VRPSolution } from '@/lib/types';
import { solveVRPWithQAOA } from '@/lib/quantum/qaoa';
import { solveVRPClassical } from '@/lib/solvers/classical';
import { toast } from '@/components/ui/use-toast';
import { PlayIcon, AtomIcon, Calculator } from 'lucide-react';

const Index = () => {
  const [problem, setProblem] = useState<VRPProblem | undefined>();
  const [qaoaParams, setQaoaParams] = useState<QAOAParams>({
    p: 1,
    backend: 'qasm_simulator',
    shots: 1000
  });
  const [quantumSolution, setQuantumSolution] = useState<VRPSolution | undefined>();
  const [classicalSolution, setClassicalSolution] = useState<VRPSolution | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSolver, setActiveSolver] = useState<'quantum' | 'classical' | 'both' | null>(null);

  // Handle problem generation
  const handleProblemGenerated = (newProblem: VRPProblem) => {
    setProblem(newProblem);
    setQuantumSolution(undefined);
    setClassicalSolution(undefined);
    setActiveSolver(null);
    toast({
      title: "Problem Generated",
      description: `Created a VRP with ${newProblem.nodes.length} nodes and ${newProblem.vehicles.length} vehicles.`,
    });
  };

  // Handle QAOA parameter changes
  const handleQAOAParamsChange = (params: QAOAParams) => {
    setQaoaParams(params);
  };

  // Solve using quantum approach (QAOA)
  const solveWithQuantum = async () => {
    if (!problem) return;
    
    setIsLoading(true);
    setActiveSolver('quantum');
    
    try {
      const solution = await solveVRPWithQAOA(problem, qaoaParams);
      setQuantumSolution(solution);
      toast({
        title: "Quantum Solution Ready",
        description: `Found routes with total distance: ${solution.totalDistance.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Error in quantum solver:', error);
      toast({
        variant: "destructive",
        title: "Quantum Solver Error",
        description: "Failed to compute the quantum solution.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Solve using classical approach
  const solveWithClassical = async () => {
    if (!problem) return;
    
    setIsLoading(true);
    setActiveSolver('classical');
    
    try {
      const solution = await solveVRPClassical(problem);
      setClassicalSolution(solution);
      toast({
        title: "Classical Solution Ready",
        description: `Found routes with total distance: ${solution.totalDistance.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Error in classical solver:', error);
      toast({
        variant: "destructive",
        title: "Classical Solver Error",
        description: "Failed to compute the classical solution.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Solve using both approaches for comparison
  const solveWithBoth = async () => {
    if (!problem) return;
    
    setIsLoading(true);
    setActiveSolver('both');
    
    try {
      const [quantumSol, classicalSol] = await Promise.all([
        solveVRPWithQAOA(problem, qaoaParams),
        solveVRPClassical(problem)
      ]);
      
      setQuantumSolution(quantumSol);
      setClassicalSolution(classicalSol);
      
      const betterSolution = quantumSol.totalDistance <= classicalSol.totalDistance
        ? 'Quantum'
        : 'Classical';
      
      toast({
        title: "Solutions Ready",
        description: `${betterSolution} solution found shorter routes.`,
      });
    } catch (error) {
      console.error('Error solving problem:', error);
      toast({
        variant: "destructive",
        title: "Solver Error",
        description: "Failed to compute one or both solutions.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-quantum-bg">
      <Header />
      
      <main className="container py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar with problem setup */}
          <div className="space-y-4">
            <ProblemInput 
              onProblemGenerated={handleProblemGenerated} 
              onQAOAParamsChange={handleQAOAParamsChange}
              isLoading={isLoading}
            />
            
            <Card className="quantum-card">
              <div className="space-y-3">
                <Button 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={solveWithQuantum}
                  disabled={!problem || isLoading}
                >
                  <AtomIcon className="w-4 h-4" />
                  <span>Solve with QAOA</span>
                </Button>
                
                <Button 
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                  onClick={solveWithClassical}
                  disabled={!problem || isLoading}
                >
                  <Calculator className="w-4 h-4" />
                  <span>Solve with Classical</span>
                </Button>
                
                <Separator />
                
                <Button 
                  className="w-full bg-quantum-purple hover:bg-quantum-purple/90 flex items-center justify-center gap-2"
                  onClick={solveWithBoth}
                  disabled={!problem || isLoading}
                >
                  <PlayIcon className="w-4 h-4" />
                  <span>Compare Both Approaches</span>
                </Button>
              </div>
            </Card>
            
            <Card className="quantum-card bg-quantum-dark">
  <div className="space-y-3 text-center">
    <h1 className="text-2xl font-bold text-white">Arnab Rai - 22BDS005</h1>
    <h1 className="text-2xl font-bold text-white">Harsh Raj - 22BDS027</h1>
    <h1 className="text-2xl font-bold text-white">Preethi - 22BDS045🐂</h1>
  </div>
</Card>

          </div>
          
          {/* Main content with visualization and results */}
          <div className="lg:col-span-2 space-y-8">
            <RouteVisualization 
              problem={problem} 
              routes={activeSolver === 'classical' ? classicalSolution?.routes : quantumSolution?.routes} 
            />
            
            <ResultsPanel 
              problem={problem}
              quantumSolution={quantumSolution}
              classicalSolution={classicalSolution}
              qaoaParams={qaoaParams}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
      
      <footer className="py-4 border-t border-border">
        <div className="container flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Quantum Route Navigator - QAOA VRP Solver</span>
          <span className="text-xs text-muted-foreground">v1.0.0</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
