import { Graph, createRandomGraph, Edge, Node } from '@/algorithms-core/graphs_common';

describe('Graph class', () => {
  test('creates a new graph with no nodes', () => {
    const graph = new Graph();
    expect(Object.keys(graph.nodes).length).toBe(0);
  });

  test('add_node adds a node to the graph', () => {
    const graph = new Graph();
    graph.add_node('node-1', 10);
    
    expect(Object.keys(graph.nodes).length).toBe(1);
    expect(graph.nodes['node-1']).toBeDefined();
    expect(graph.nodes['node-1'].id).toBe('node-1');
    expect(graph.nodes['node-1'].value).toBe(10);
    expect(graph.nodes['node-1'].outgoing_edges).toBeNull();
    expect(graph.nodes['node-1'].incoming_edges).toBeNull();
  });

  test('add_node does not duplicate existing nodes', () => {
    const graph = new Graph();
    graph.add_node('node-1', 10);
    graph.add_node('node-1', 20); // Attempt to add duplicate node with different value
    
    expect(Object.keys(graph.nodes).length).toBe(1);
    expect(graph.nodes['node-1'].value).toBe(10); // Should keep original value
  });

  test('add_edge adds an edge between two nodes', () => {
    const graph = new Graph();
    graph.add_node('node-1', 10);
    graph.add_node('node-2', 20);
    
    const edge = graph.add_edge('node-1', 'node-2', 5);
    
    expect(edge).not.toBeNull();
    expect(edge?.id).toBe('node-1-node-2');
    expect(edge?.data).toBe(5);
    expect(edge?.from_node).toBe(graph.nodes['node-1']);
    expect(edge?.to_node).toBe(graph.nodes['node-2']);
    
    // Check outgoing edge from node-1
    expect(graph.nodes['node-1'].outgoing_edges).toBe(edge);
    expect(graph.nodes['node-1'].outgoing_edges?.next_from).toBeNull();
    
    // Check incoming edge to node-2
    expect(graph.nodes['node-2'].incoming_edges).toBe(edge);
    expect(graph.nodes['node-2'].incoming_edges?.next_to).toBeNull();
  });

  test('add_edge returns null for non-existent nodes', () => {
    const graph = new Graph();
    graph.add_node('node-1', 10);
    
    const edge1 = graph.add_edge('node-1', 'node-2', 5); // node-2 doesn't exist
    const edge2 = graph.add_edge('node-3', 'node-1', 5); // node-3 doesn't exist
    
    expect(edge1).toBeNull();
    expect(edge2).toBeNull();
  });

  test('add_edge handles multiple edges from same source', () => {
    const graph = new Graph();
    graph.add_node('node-1', 10);
    graph.add_node('node-2', 20);
    graph.add_node('node-3', 30);
    
    const edge1 = graph.add_edge('node-1', 'node-2', 5);
    const edge2 = graph.add_edge('node-1', 'node-3', 10);
    
    expect(edge1).not.toBeNull();
    expect(edge2).not.toBeNull();
    
    // Check linked list structure of outgoing edges
    expect(graph.nodes['node-1'].outgoing_edges).toBe(edge1);
    expect(graph.nodes['node-1'].outgoing_edges?.next_from).toBe(edge2);
    expect(graph.nodes['node-1'].outgoing_edges?.next_from?.next_from).toBeNull();
    
    // Check incoming edges
    expect(graph.nodes['node-2'].incoming_edges).toBe(edge1);
    expect(graph.nodes['node-3'].incoming_edges).toBe(edge2);
  });

  test('add_edge handles multiple edges to same target', () => {
    const graph = new Graph();
    graph.add_node('node-1', 10);
    graph.add_node('node-2', 20);
    graph.add_node('node-3', 30);
    
    const edge1 = graph.add_edge('node-1', 'node-3', 5);
    const edge2 = graph.add_edge('node-2', 'node-3', 10);
    
    expect(edge1).not.toBeNull();
    expect(edge2).not.toBeNull();
    
    // Check incoming linked list structure
    expect(graph.nodes['node-3'].incoming_edges).toBe(edge1);
    expect(graph.nodes['node-3'].incoming_edges?.next_to).toBe(edge2);
    expect(graph.nodes['node-3'].incoming_edges?.next_to?.next_to).toBeNull();
  });

  test('remove_edge removes an edge from the graph', () => {
    const graph = new Graph();
    graph.add_node('node-1', 10);
    graph.add_node('node-2', 20);
    
    graph.add_edge('node-1', 'node-2', 5);
    graph.remove_edge('node-1', 'node-2');
    
    expect(graph.nodes['node-1'].outgoing_edges).toBeNull();
    expect(graph.nodes['node-2'].incoming_edges).toBeNull();
  });

  test('remove_edge handles non-existent edges', () => {
    const graph = new Graph();
    graph.add_node('node-1', 10);
    graph.add_node('node-2', 20);
    
    // This should not throw an error
    graph.remove_edge('node-1', 'node-2');
    graph.remove_edge('non-existent', 'node-2');
    graph.remove_edge('node-1', 'non-existent');
    
    // These should still be empty
    expect(graph.nodes['node-1'].outgoing_edges).toBeNull();
    expect(graph.nodes['node-2'].incoming_edges).toBeNull();
  });

  test('remove_edge handles middle edges in a list', () => {
    const graph = new Graph();
    graph.add_node('node-1', 10);
    graph.add_node('node-2', 20);
    graph.add_node('node-3', 30);
    graph.add_node('node-4', 40);
    
    const edge1 = graph.add_edge('node-1', 'node-2', 5);
    const edge2 = graph.add_edge('node-1', 'node-3', 10);
    const edge3 = graph.add_edge('node-1', 'node-4', 15);
    
    graph.remove_edge('node-1', 'node-3'); // Remove middle edge
    
    // Check outgoing linked list structure after removal
    expect(graph.nodes['node-1'].outgoing_edges).toBe(edge1);
    expect(graph.nodes['node-1'].outgoing_edges?.next_from).toBe(edge3);
    expect(graph.nodes['node-1'].outgoing_edges?.next_from?.next_from).toBeNull();
  });

  test('get_all_edges returns all edges in the graph', () => {
    const graph = new Graph();
    graph.add_node('node-1', 10);
    graph.add_node('node-2', 20);
    graph.add_node('node-3', 30);
    
    graph.add_edge('node-1', 'node-2', 5);
    graph.add_edge('node-2', 'node-3', 10);
    graph.add_edge('node-1', 'node-3', 15);
    
    const edges = graph.get_all_edges();
    
    expect(edges.length).toBe(3);
    
    // Check that all edges are present
    const edgeIds = edges.map(e => e.id);
    expect(edgeIds).toContain('node-1-node-2');
    expect(edgeIds).toContain('node-2-node-3');
    expect(edgeIds).toContain('node-1-node-3');
  });
});

describe('createRandomGraph', () => {
  test('creates a graph with the specified number of nodes', () => {
    const nodeCount = 10;
    const graph = createRandomGraph(nodeCount);
    
    expect(Object.keys(graph.nodes).length).toBe(nodeCount);
  });

  test('creates nodes with values in the specified range', () => {
    const nodeCount = 10;
    const minValue = 50;
    const maxValue = 100;
    
    const graph = createRandomGraph(nodeCount, 0.3, minValue, maxValue);
    
    Object.values(graph.nodes).forEach(node => {
      expect(node.value).toBeGreaterThanOrEqual(minValue);
      expect(node.value).toBeLessThanOrEqual(maxValue);
    });
  });

  test('creates a connected graph', () => {
    const nodeCount = 10;
    const graph = createRandomGraph(nodeCount);
    
    // A connected graph with n nodes must have at least n-1 edges
    const edges = graph.get_all_edges();
    expect(edges.length).toBeGreaterThanOrEqual(nodeCount - 1);
    
    // Check if the graph is connected using BFS
    const visited = new Set<string>();
    const queue: Node[] = [];
    
    // Start BFS from the first node
    const startNode = Object.values(graph.nodes)[0];
    queue.push(startNode);
    visited.add(startNode.id);
    
    while (queue.length > 0) {
      const node = queue.shift()!;
      
      // Process outgoing edges
      let edge = node.outgoing_edges;
      while (edge !== null) {
        if (!visited.has(edge.to_node.id)) {
          visited.add(edge.to_node.id);
          queue.push(edge.to_node);
        }
        edge = edge.next_from;
      }
      
      // Process incoming edges
      edge = node.incoming_edges;
      while (edge !== null) {
        if (!visited.has(edge.from_node.id)) {
          visited.add(edge.from_node.id);
          queue.push(edge.from_node);
        }
        edge = edge.next_to;
      }
    }
    
    // If the graph is connected, all nodes should be visited
    expect(visited.size).toBe(nodeCount);
  });

  test('respects edge density parameter', () => {
    const nodeCount = 10;
    const edgeDensity = 0.5; // 50% of possible edges
    
    // Maximum possible edges for directed graph with n nodes is n(n-1)
    const maxPossibleEdges = nodeCount * (nodeCount - 1);
    const expectedMaxEdges = Math.floor(maxPossibleEdges * edgeDensity);
    
    const graph = createRandomGraph(nodeCount, edgeDensity);
    const edges = graph.get_all_edges();
    
    // Allow some flexibility due to the random nature
    // and the fact that we're ensuring connectivity first
    expect(edges.length).toBeLessThanOrEqual(expectedMaxEdges);
    expect(edges.length).toBeGreaterThanOrEqual(nodeCount - 1);
  });
});