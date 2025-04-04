import { create } from 'zustand';

const useTransitionStore = create((set) => ({
    isVisible: false,
    isTransitioning: false,
    rows: 6,
    direction: 'forward', // Initial direction

    // Start the transition by setting visibility and transitioning state
    startTransition: () => set({ isTransitioning: true, direction: 'forward' }),

    // Complete the transition and set the next state
    endTransition: () => set({ isTransitioning: false, direction: 'reverse' }),

    // Set reverse direction for closing the transition
    reverseTransition: () => set({ isVisible: false, direction: 'reverse' }),

    // Set rows dynamically
    setRows: (rows) => set({ rows }),

    setDirection: (direction) => set({ direction }),

    // Reset to the initial state after reverse animation
    resetTransition: () => set({ isVisible: false, isTransitioning: false, direction: 'forward' }),
}));

export default useTransitionStore;