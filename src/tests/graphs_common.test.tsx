import * as graphsCommon from '@/algorithms-core/graphs_common';

const printConsole = false;

describe('generateRandomGraph', () => {
  test('returns an array of the specified length', () => {
    const length = 10;
    const result = graphsCommon.generateRandomGraph(length, 1, 100);
    expect(result).toHaveLength(length);
  });

  test('all nodes have unique ids', () => {
    const length = 10;
    const result = graphsCommon.generateRandomGraph(length, 1, 100);
    
    const ids = result.map(node => node.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(length);
  });
});

describe('addNeighbors', () => {
  test('adds neighbors to each node', () => {
    const nodes = graphsCommon.generateRandomGraph(5, 1, 100);
    graphsCommon.addNeighbors(nodes, 3);

    nodes.forEach(node => {
      expect(node.neighbors.length).toBeLessThanOrEqual(3);
      node.neighbors.forEach(neighbor => {
        expect(neighbor).not.toEqual(node);
      });
    });
  });

  test('does not add self as neighbor', () => {
    const nodes = graphsCommon.generateRandomGraph(5, 1, 100);
    graphsCommon.addNeighbors(nodes, 3);

    nodes.forEach(node => {
      expect(node.neighbors).not.toContain(node);
    });
  });
});

describe('debugGraphNoNeighbors', () => {
  test('logs node information without neighbors', () => {
    const nodes = graphsCommon.generateRandomGraph(5, 1, 100);
    const consoleLogSpy = printConsole ? jest.spyOn(console, 'log').mockImplementation(
      (...args) => {
        const originalConsoleLog = jest.requireActual('console').log;
        originalConsoleLog(...args);
      }
    ) : jest.spyOn(console, 'log').mockImplementation() ;
    graphsCommon.debugGraph(nodes);

    nodes.forEach(node => {
      expect(consoleLogSpy).toHaveBeenCalledWith(`Node ID: ${node.id}`);
      expect(consoleLogSpy).toHaveBeenCalledWith(`Value: ${node.value}`);
      expect(consoleLogSpy).toHaveBeenCalledWith(`Neighbors: `);
    });

    consoleLogSpy.mockRestore();
  });
});

describe('debugGraphWithNeighbors', () => {
  test('logs node information with neighbors', () => {
    const nodes = graphsCommon.generateRandomGraph(5, 1, 100);
    const consoleLogSpy = printConsole ? jest.spyOn(console, 'log').mockImplementation(
      (...args) => {
        const originalConsoleLog = jest.requireActual('console').log;
        originalConsoleLog(...args);
      }
    ) : jest.spyOn(console, 'log').mockImplementation() ;

    graphsCommon.addNeighbors(nodes, 3, 0);
    graphsCommon.debugGraph(nodes);

    nodes.forEach(node => {
      expect(consoleLogSpy).toHaveBeenCalledWith(`Node ID: ${node.id}`);
      expect(consoleLogSpy).toHaveBeenCalledWith(`Value: ${node.value}`);
      expect(consoleLogSpy).toHaveBeenCalledWith(`Neighbors: ${node.neighbors.map(n => n.id).join(", ")}`);
    });

    consoleLogSpy.mockRestore();
  });
});

describe('debugGraphConnectedWithNeighbors', () => {
  test('logs node information with neighbors', () => {
    const nodes = graphsCommon.generateRandomGraph(5, 1, 100);
    const consoleLogSpy = printConsole ? jest.spyOn(console, 'log').mockImplementation(
      (...args) => {
        const originalConsoleLog = jest.requireActual('console').log;
        originalConsoleLog(...args);
      }
    ) : jest.spyOn(console, 'log').mockImplementation() ;

    graphsCommon.addNeighbors(nodes, 3, 1);
    graphsCommon.debugGraph(nodes);

    nodes.forEach(node => {
      expect(consoleLogSpy).toHaveBeenCalledWith(`Node ID: ${node.id}`);
      expect(consoleLogSpy).toHaveBeenCalledWith(`Value: ${node.value}`);
      expect(consoleLogSpy).toHaveBeenCalledWith(`Neighbors: ${node.neighbors.map(n => n.id).join(", ")}`);
    });

    consoleLogSpy.mockRestore();
  });

  describe('createConnectedGraph', () => {
    test('creates a connected graph', () => {
      const nodes = graphsCommon.generateRandomGraph(5, 1, 100);
      graphsCommon.createConnectedGraph(nodes);

      const connectedIds = new Set<string>();
      nodes.forEach(node => {
        connectedIds.add(node.id);
        node.neighbors.forEach(neighbor => {
          connectedIds.add(neighbor.id);
        });
      });

      expect(connectedIds.size).toBe(nodes.length);
    });

    test('does not create self-loops', () => {
      const nodes = graphsCommon.generateRandomGraph(5, 1, 100);
      graphsCommon.createConnectedGraph(nodes);

      nodes.forEach(node => {
        expect(node.neighbors).not.toContain(node);
      });
    });

    test('connected graph does not contain duplicate edges', () => {
      //generate random graph thats fully connected with random neighbors
      const nodes = graphsCommon.generateRandomGraph(5, 1, 100);
      graphsCommon.createConnectedGraph(nodes);
      graphsCommon.addNeighbors(nodes, 3, 1);

      // Check for duplicate edges
      let duplicateEdges = false;
      nodes.forEach(node => {
        const neighborIds = node.neighbors.map(n => n.id);
        const uniqueNeighborIds = new Set(neighborIds);
        if (uniqueNeighborIds.size !== neighborIds.length) {
          duplicateEdges = true;
          throw new Error(`Node ${node.id} contains duplicate edges. Expected ${neighborIds.length} unique neighbors but got ${uniqueNeighborIds.size}`);
        }
      });
      expect(duplicateEdges).toBe(false);
    });
  });

});