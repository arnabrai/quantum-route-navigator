
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VRPProblem, VRPSolution } from '@/lib/types';
import { GitCompare, ArrowUp, ArrowDown } from 'lucide-react';

interface RouteComparisonPanelProps {
  problem?: VRPProblem;
  quantumSolution?: VRPSolution;
  classicalSolution?: VRPSolution;
  isLoading: boolean;
}

const RouteComparisonPanel: React.FC<RouteComparisonPanelProps> = ({
  problem,
  quantumSolution,
  classicalSolution,
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

  if (!problem || (!quantumSolution && !classicalSolution && !isLoading)) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Generate solutions to see comparison</p>
      </div>
    );
  }

  return (
    <CardContent className="space-y-6">
      {(!quantumSolution && !classicalSolution) ? renderLoadingOrEmpty() : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Solver</span>
              <span className="font-medium">
                <Badge variant="outline" className="bg-quantum-purple/20 text-quantum-purple">
                  Quantum (QAOA)
                </Badge>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Distance</span>
              <span className="font-medium">{formatDistance(quantumSolution?.totalDistance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Execution Time</span>
              <span className="font-medium">{formatTime(quantumSolution?.executionTime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Backend</span>
              <span className="font-medium">{quantumSolution?.solver || 'quantum'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Solver</span>
              <span className="font-medium">
                <Badge variant="outline" className="bg-quantum-blue/20 text-quantum-blue">
                  Classical
                </Badge>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Distance</span>
              <span className="font-medium">{formatDistance(classicalSolution?.totalDistance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Execution Time</span>
              <span className="font-medium">{formatTime(classicalSolution?.executionTime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Algorithm</span>
              <span className="font-medium">Greedy</span>
            </div>
          </div>
        </div>
      )}

      {(quantumSolution && classicalSolution) && (
        <>
          <div className="pt-4 space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-1">
              <GitCompare className="w-4 h-4" />
              <span>Distance Comparison</span>
            </h3>
            <div className="h-8 w-full bg-quantum-dark rounded overflow-hidden flex">
              <div 
                className="h-full bg-quantum-purple flex items-center justify-center text-xs text-white font-medium"
                style={{ 
                  width: `${(quantumSolution.totalDistance / (quantumSolution.totalDistance + classicalSolution.totalDistance)) * 100}%` 
                }}
              >
                {((quantumSolution.totalDistance / (quantumSolution.totalDistance + classicalSolution.totalDistance)) * 100).toFixed(0)}%
              </div>
              <div 
                className="h-full bg-quantum-blue flex items-center justify-center text-xs text-white font-medium"
                style={{ 
                  width: `${(classicalSolution.totalDistance / (quantumSolution.totalDistance + classicalSolution.totalDistance)) * 100}%` 
                }}
              >
                {((classicalSolution.totalDistance / (quantumSolution.totalDistance + classicalSolution.totalDistance)) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Quantum Solution</span>
              <span>Classical Solution</span>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-medium flex items-center gap-1">
              {quantumSolution.totalDistance < classicalSolution.totalDistance ? (
                <ArrowDown className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowUp className="w-4 h-4 text-red-500" />
              )}
              <span>Performance Insight</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              {quantumSolution.totalDistance < classicalSolution.totalDistance ? (
                `The quantum solution found a better route with ${((classicalSolution.totalDistance - quantumSolution.totalDistance) / classicalSolution.totalDistance * 100).toFixed(1)}% shorter total distance compared to the classical algorithm.`
              ) : (
                `For this problem size, the classical algorithm performed better, finding a route with ${((quantumSolution.totalDistance - classicalSolution.totalDistance) / quantumSolution.totalDistance * 100).toFixed(1)}% shorter distance.`
              )}
            </p>
          </div>
        </>
      )}
    </CardContent>
  );
};

export default RouteComparisonPanel;
