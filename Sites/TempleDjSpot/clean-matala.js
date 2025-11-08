// Clean Matala from Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAkIjtyaYwcTPsFcDfJsoyQgRzCakgd1ic",
  authDomain: "portal-ui-1eac6.firebaseapp.com",
  projectId: "portal-ui-1eac6",
  storageBucket: "portal-ui-1eac6.firebasestorage.app",
  messagingSenderId: "234949673103",
  appId: "1:234949673103:web:c502f79df4b040305f30fa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const appId = 'temple-djs';

async function cleanMatala() {
  console.log('🔍 Searching for Matala in all stages...\n');
  
  const stages = ['mainStage', 'dubPub', 'technoHub'];
  let totalRemoved = 0;

  for (const stage of stages) {
    console.log(`\n📍 Checking ${stage}...`);
    const scheduleRef = doc(db, `apps/${appId}/schedule/${stage}`);
    
    try {
      const scheduleDoc = await getDoc(scheduleRef);

      if (!scheduleDoc.exists()) {
        console.log(`   ⚠️  No schedule found`);
        continue;
      }

      const timeSlots = scheduleDoc.data().timeSlots || [];
      let modified = false;

      const newTimeSlots = timeSlots.map(slot => {
        // Check if Matala is main DJ
        if (slot.djName === 'Matala' || slot.djId === 'matala') {
          console.log(`   ✅ ${slot.time}: Removed Matala (main DJ)`);
          modified = true;
          totalRemoved++;
          return { time: slot.time, djId: null, djName: null, guests: [] };
        }

        // Check if Matala is in guests array
        if (slot.guests && Array.isArray(slot.guests)) {
          const beforeCount = slot.guests.length;
          const filteredGuests = slot.guests.filter(g => 
            g.djName !== 'Matala' && g.djId !== 'matala'
          );
          if (filteredGuests.length < beforeCount) {
            console.log(`   ✅ ${slot.time}: Removed Matala (guest)`);
            modified = true;
            totalRemoved++;
            return { ...slot, guests: filteredGuests };
          }
        }

        return slot;
      });

      if (modified) {
        await updateDoc(scheduleRef, { timeSlots: newTimeSlots });
        console.log(`   💾 Updated Firestore`);
      } else {
        console.log(`   ℹ️  No Matala found`);
      }
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
  }

  console.log(`\n✨ Complete! Removed ${totalRemoved} instance(s) of Matala`);
  process.exit(0);
}

cleanMatala().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
