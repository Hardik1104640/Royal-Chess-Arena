// guest-account.js — Shared guest account pool management
// Separates guest pool logic so it can be used across all pages

const GUEST_POOL_KEY = 'guestPool_v1';
const CURRENT_GUEST_KEY = 'currentGuest';
const USER_PROFILE_KEY = 'userProfile';

window.GuestPool = {
  generateGuests(startIndex, count){
    const arr = [];
    for(let i=0;i<count;i++) arr.push({name:`guest_${startIndex + i}`, occupied:false});
    return arr;
  },

  loadPool(){
    const raw = localStorage.getItem(GUEST_POOL_KEY);
    if(!raw) {
      const pool = this.generateGuests(1, 200); // initial 200 guests
      localStorage.setItem(GUEST_POOL_KEY, JSON.stringify(pool));
      return pool;
    }
    try{ return JSON.parse(raw) || []; } catch(e){ return []; }
  },

  savePool(pool){ 
    localStorage.setItem(GUEST_POOL_KEY, JSON.stringify(pool)); 
  },

  ensureMoreIfNeeded(){
    const pool = this.loadPool();
    const free = pool.filter(g=>!g.occupied).length;
    if(free < 100){
      const nextIndex = pool.length + 1;
      const more = this.generateGuests(nextIndex, 10000);
      pool.push(...more);
      this.savePool(pool);
    }
  },

  assign(){
    const pool = this.loadPool();
    let idx = pool.findIndex(g => !g.occupied);
    if(idx === -1){
      // create more and pick first
      const nextIndex = pool.length + 1;
      const more = this.generateGuests(nextIndex, 1000);
      pool.push(...more);
      idx = pool.findIndex(g => !g.occupied);
    }
    const guest = pool[idx];
    pool[idx].occupied = true;
    this.savePool(pool);
    // persist in session
    sessionStorage.setItem(CURRENT_GUEST_KEY, guest.name);
    // initialize guest-scoped data
    localStorage.setItem(`guestdata:${guest.name}`, JSON.stringify({created:Date.now()}));
    // store user profile
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify({username:guest.name, guest:true}));
    // replenish if needed
    this.ensureMoreIfNeeded();
    console.log('Assigned guest account:', guest.name);
    return guest.name;
  },

  release(guestName){
    if(!guestName) return;
    const pool = this.loadPool();
    const idx = pool.findIndex(g => g.name === guestName);
    if(idx !== -1){ 
      pool[idx].occupied = false; 
      this.savePool(pool); 
      console.log('Released guest account:', guestName);
    }
    // clear guest data keys
    const prefix = `guestdata:${guestName}`;
    for(const k of Object.keys(localStorage)){
      if(k.startsWith(prefix)) localStorage.removeItem(k);
    }
    // clear current guest marker
    if(sessionStorage.getItem(CURRENT_GUEST_KEY) === guestName) {
      sessionStorage.removeItem(CURRENT_GUEST_KEY);
    }
  },

  getCurrent(){
    // prefer session storage
    const s = sessionStorage.getItem(CURRENT_GUEST_KEY);
    if(s) return s;
    // fallback to profile
    try{
      const p = JSON.parse(localStorage.getItem(USER_PROFILE_KEY) || 'null');
      if(p && p.guest && p.username) return p.username;
    }catch(e){}
    return null;
  },

  isGuest(){
    const name = this.getCurrent();
    return name && name.startsWith('guest_');
  },

  releaseCurrentAndClear(){
    const name = this.getCurrent();
    if(name){
      this.release(name);
      try{ localStorage.removeItem(USER_PROFILE_KEY); }catch(e){}
      console.log('Cleared guest profile:', name);
    }
  }
};
