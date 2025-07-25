// require('@testing-library/jest-dom');

// // Mock d3 to avoid ESM issues
// jest.mock('d3', () => ({
//   select: jest.fn(),
//   max: jest.fn(),
//   scaleLinear: jest.fn(() => ({
//     domain: jest.fn().mockReturnThis(),
//     range: jest.fn().mockReturnThis()
//   })),
//   zoom: jest.fn(() => ({
//     scaleExtent: jest.fn().mockReturnThis(),
//     on: jest.fn().mockReturnThis()
//   }))
// }));

// // Mock browser APIs not available in Jest
// Object.defineProperty(window, 'matchMedia', {
//   writable: true,
//   value: jest.fn().mockImplementation(query => ({
//     matches: false,
//     media: query,
//     onchange: null,
//     addListener: jest.fn(),
//     removeListener: jest.fn(),
//     addEventListener: jest.fn(),
//     removeEventListener: jest.fn(),
//     dispatchEvent: jest.fn(),
//   })),
// });
