
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Node, Route, VRPProblem } from '@/lib/types';

interface RouteVisualizationProps {
  problem?: VRPProblem;
  routes?: Route[];
}

const RouteVisualization: React.FC<RouteVisualizationProps> = ({ problem, routes }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the nodes and routes
  useEffect(() => {
    if (!canvasRef.current || !problem || !routes) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    const margin = 40;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Find min/max coordinates to scale properly
    const nodes = problem.nodes;
    let minX = Math.min(...nodes.map(n => n.x));
    let maxX = Math.max(...nodes.map(n => n.x));
    let minY = Math.min(...nodes.map(n => n.y));
    let maxY = Math.max(...nodes.map(n => n.y));

    // Scale and translate coordinates to fit canvas
    const scaleX = (width - 2 * margin) / (maxX - minX);
    const scaleY = (height - 2 * margin) / (maxY - minY);
    const scale = Math.min(scaleX, scaleY);

    const translateX = (node: Node) => margin + (node.x - minX) * scale;
    const translateY = (node: Node) => margin + (node.y - minY) * scale;

    // Draw light grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(margin, margin + i * (height - 2 * margin) / 10);
      ctx.lineTo(width - margin, margin + i * (height - 2 * margin) / 10);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(margin + i * (width - 2 * margin) / 10, margin);
      ctx.lineTo(margin + i * (width - 2 * margin) / 10, height - margin);
      ctx.stroke();
    }

    // Draw the routes
    routes.forEach((route, index) => {
      if (route.path.length <= 1) return;
      
      const vehicleColor = problem.vehicles[route.vehicleId].color;
      ctx.strokeStyle = vehicleColor;
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Draw path between nodes
      for (let i = 0; i < route.path.length; i++) {
        const nodeIndex = route.path[i];
        const node = problem.nodes[nodeIndex];
        const x = translateX(node);
        const y = translateY(node);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    });

    // Draw the nodes
    problem.nodes.forEach((node, index) => {
      const x = translateX(node);
      const y = translateY(node);
      
      const isDepot = index === 0;
      
      // Draw node circle
      ctx.beginPath();
      ctx.arc(x, y, isDepot ? 12 : 8, 0, 2 * Math.PI);
      
      if (isDepot) {
        ctx.fillStyle = '#20E3B2';
      } else {
        ctx.fillStyle = '#2A2A3C';
      }
      
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Add node label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = isDepot ? 'bold 12px sans-serif' : '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(index.toString(), x, y);
    });

    // Add legend for vehicles
    const legendY = height - 15;
    routes.forEach((route, index) => {
      const vehicle = problem.vehicles[route.vehicleId];
      const x = width - margin - (routes.length - index) * 80;
      
      ctx.fillStyle = vehicle.color;
      ctx.beginPath();
      ctx.arc(x, legendY, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Vehicle ${vehicle.id}`, x + 10, legendY);
    });

  }, [problem, routes]);

  if (!problem || !routes) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Route Visualization</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80 bg-quantum-dark">
          <p className="text-muted-foreground">Generate a problem to visualize routes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span>Route Visualization</span>
          <span className="text-xs text-muted-foreground">
            {problem.nodes.length} nodes, {problem.vehicles.length} vehicles
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 bg-quantum-dark">
        <canvas ref={canvasRef} width="800" height="400" className="w-full h-96" />
      </CardContent>
    </Card>
  );
};

export default RouteVisualization;
