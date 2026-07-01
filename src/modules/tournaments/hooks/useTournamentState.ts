// ───────────────────────────────────────────────────────────────────────────── 

// Tournament Module — Zustand State Store 

// Fixed ID type compatibility, rigid matching, and comprehensive wizard resetting 

// ───────────────────────────────────────────────────────────────────────────── 



import { create } from 'zustand';

import type {

  Tournament,
  PlayerProfile,
  TournamentStatus,
  UserRole,
  PaymentMethod,
  MatchStatus,
} from '../types/tournament';



// ── Registration Wizard State ──────────────────────────────────────────────── 



interface RegistrationData {

  teamName: string;

  memberIds: (string | number)[]; // 💡 دعم المعرفات النصية والرقمية لمنع مشاكل الـ Backend 

  selectedPlayers: PlayerProfile[];

  paymentMethod: PaymentMethod | '';

}



const defaultRegistrationData: RegistrationData = {

  teamName: '',

  memberIds: [],

  selectedPlayers: [],

  paymentMethod: '',

};



// ── Full Store Shape ───────────────────────────────────────────────────────── 



interface TournamentState {

  // ── Role Simulation ────────────────────────────────────────────────────── 

  currentRole: UserRole;

  setRole: (role: UserRole) => void;



  // ── Explore Page Filters ───────────────────────────────────────────────── 

  searchQuery: string;

  setSearchQuery: (query: string) => void;

  statusFilter: TournamentStatus | 'All';

  setStatusFilter: (status: TournamentStatus | 'All') => void;



  // ── Active Tournament (TournamentDetails) ──────────────────────────────── 

  activeTournament: Tournament | null;

  setActiveTournament: (t: Tournament | null) => void;

  isLoadingTournament: boolean;

  setLoadingTournament: (v: boolean) => void;

  tournamentError: string | null;

  setTournamentError: (msg: string | null) => void;



  /** Optimistically update a match score inside the active tournament */

  updateMatchScore: (matchId: string | number, scoreA: number, scoreB: number) => void;



  // ── Registration Wizard ────────────────────────────────────────────────── 

  isRegisterModalOpen: boolean;

  openRegisterModal: () => void;

  closeRegisterModal: () => void;



  registerStep: 1 | 2 | 3;

  goToStep: (step: 1 | 2 | 3) => void;

  nextStep: () => void;

  prevStep: () => void;



  registrationData: RegistrationData;

  setTeamName: (name: string) => void;

  addMember: (player: PlayerProfile) => void;

  removeMember: (playerId: string | number) => void;

  setPaymentMethod: (method: PaymentMethod) => void;

  resetRegistration: () => void;



  // ── Player search (within wizard) ──────────────────────────────────────── 

  playerSearchQuery: string;

  setPlayerSearchQuery: (q: string) => void;

  playerSearchResults: PlayerProfile[];

  setPlayerSearchResults: (results: PlayerProfile[]) => void;

  isSearchingPlayers: boolean;

  setSearchingPlayers: (v: boolean) => void;

}



// ── Store Implementation ───────────────────────────────────────────────────── 



export const useTournamentState = create<TournamentState>((set, get) => ({

  // Role Simulation 

  currentRole: 'PLAYER' as UserRole,

  setRole: (role) => set({ currentRole: role }),



  // Explore Page Filters 

  searchQuery: '',

  setSearchQuery: (query) => set({ searchQuery: query }),

  statusFilter: 'All',

  setStatusFilter: (status) => set({ statusFilter: status }),



  // Active Tournament 

  activeTournament: null,

  setActiveTournament: (t) => set({ activeTournament: t }),

  isLoadingTournament: false,

  setLoadingTournament: (v) => set({ isLoadingTournament: v }),

  tournamentError: null,

  setTournamentError: (msg) => set({ tournamentError: msg }),



  updateMatchScore: (matchId, scoreA, scoreB) => {

    const { activeTournament } = get();

    if (!activeTournament?.matches) return;

    set({

      activeTournament: {

        ...activeTournament,

        matches: activeTournament.matches.map((m) =>

          m.id.toString() === matchId.toString()

            ? { ...m, scoreA, scoreB, status: 'Completed' as MatchStatus }

            : m

        ),

      },

    });

  },



  // Wizard Open/Close 

  isRegisterModalOpen: false,

  openRegisterModal: () => set({ isRegisterModalOpen: true, registerStep: 1 }),

  closeRegisterModal: () => set({ isRegisterModalOpen: false, registerStep: 1 }),



  // Wizard Steps Navigation 

  registerStep: 1,

  goToStep: (step) => set({ registerStep: step }),

  nextStep: () => {

    const { registerStep } = get();

    if (registerStep < 3) set({ registerStep: (registerStep + 1) as 1 | 2 | 3 });

  },

  prevStep: () => {

    const { registerStep } = get();

    if (registerStep > 1) set({ registerStep: (registerStep - 1) as 1 | 2 | 3 });

  },



  // Registration Data Actions 

  registrationData: { ...defaultRegistrationData },

  setTeamName: (name) =>

    set((s) => ({

      registrationData: { ...s.registrationData, teamName: name },

    })),



  addMember: (player) =>

    set((s) => {

      // 💡 تحويل المعرفات لنصوص أثناء المقارنة لضمان دقة التحقق ومنع التكرار البصري 

      const exists = s.registrationData.memberIds.some(

        (id) => id.toString() === player.id.toString()

      );

      if (exists) return s;



      return {

        registrationData: {

          ...s.registrationData,

          memberIds: [...s.registrationData.memberIds, player.id],

          selectedPlayers: [...s.registrationData.selectedPlayers, player],

        },

      };

    }),



  removeMember: (playerId) =>

    set((s) => ({

      registrationData: {

        ...s.registrationData,

        memberIds: s.registrationData.memberIds.filter(

          (id) => id.toString() !== playerId.toString()

        ),

        selectedPlayers: s.registrationData.selectedPlayers.filter(

          (p) => p.id.toString() !== playerId.toString()

        ),

      },

    })),



  setPaymentMethod: (method) =>

    set((s) => ({

      registrationData: { ...s.registrationData, paymentMethod: method },

    })),



  resetRegistration: () =>

    set({

      registrationData: { ...defaultRegistrationData },

      registerStep: 1,

      isRegisterModalOpen: false,

      playerSearchQuery: '',

      playerSearchResults: [],

      isSearchingPlayers: false, // 💡 تصفير حالة التحميل لضمان عدم تعليق الواجهة 

    }),



  // Player Search Actions 

  playerSearchQuery: '',

  setPlayerSearchQuery: (q) => set({ playerSearchQuery: q }),

  playerSearchResults: [],

  setPlayerSearchResults: (results) => set({ playerSearchResults: results }),

  isSearchingPlayers: false,

  setSearchingPlayers: (v) => set({ isSearchingPlayers: v }),

}));