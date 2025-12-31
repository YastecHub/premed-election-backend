import { Candidate, Admin, AccessCode } from '../models';

const DEFAULT_CANDIDATES = [
  { name: 'Dr. Sarah "Healer" Ahmed', position: 'Governor', department: 'Medicine & Surgery (MBBS)', photoUrl: 'https://picsum.photos/200/200?random=1', manifesto: 'Better mental health support.', color: 'bg-blue-500' },
  { name: 'Mike "The Scalpel" Ross', position: 'Governor', department: 'Dentistry', photoUrl: 'https://picsum.photos/200/200?random=2', manifesto: '24/7 Library access.', color: 'bg-emerald-500' },
  { name: 'Jessica "Neuro" Wu', position: 'Governor', department: 'Pharmacy', photoUrl: 'https://picsum.photos/200/200?random=3', manifesto: 'Transparency in grading.', color: 'bg-purple-500' },
  { name: 'Chioma Okafor', position: 'President', photoUrl: 'https://via.placeholder.com/200?text=Chioma', manifesto: 'Focus on student welfare and academic excellence', voteCount: 0, isActive: true, color: 'bg-blue-500' },
  { name: 'Tunde Adebayo', position: 'President', photoUrl: 'https://via.placeholder.com/200?text=Tunde', manifesto: 'Improving campus infrastructure and student engagement', voteCount: 0, isActive: true, color: 'bg-green-500' },
  { name: 'Fatima Hassan', position: 'Vice President', photoUrl: 'https://via.placeholder.com/200?text=Fatima', manifesto: 'Bridging the gap between students and administration', voteCount: 0, isActive: true, color: 'bg-purple-500' },
  { name: 'Chukwu Emeka', position: 'Secretary', photoUrl: 'https://via.placeholder.com/200?text=Chukwu', manifesto: 'Transparent and effective communication', voteCount: 0, isActive: true, color: 'bg-orange-500' }
];

export async function seedInitialData() {
  // Insert candidates if they don't already exist by name
  for (const c of DEFAULT_CANDIDATES) {
    const exists = await Candidate.findOne({ name: c.name }).lean().exec();
    if (!exists) {
      await Candidate.create(c as any);
    }
  }

  // Ensure super admin exists (upsert)
  await Admin.findOneAndUpdate(
    { username: 'superadmin' },
    { username: 'superadmin', password: 'password123', role: 'super_admin' },
    { upsert: true }
  ).exec();

  // Seed access codes if missing
  if (await AccessCode.countDocuments() === 0) {
    const accessCodes = [
      "OPL-9012", "MAM-7679", "AFT-2838", "CHR-6515", "ERK-5903",
      "JSM-9773", "MOG-9972", "PCS-3610", "SAN-6402", "SYM-2320",
      "VEE-8578", "XOX-8401", "ZAE-8030", "BMZ-4944"
    ];

    await AccessCode.insertMany(accessCodes.map(code => ({ code, isUsed: false })));
    console.log(`Seeded ${accessCodes.length} access codes`);
  }

  console.log('Seeding complete');
}
