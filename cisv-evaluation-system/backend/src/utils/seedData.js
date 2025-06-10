require('dotenv').config();
const mongoose = require('mongoose');
const Camp = require('../models/Camp');
const Subcamp = require('../models/Subcamp');
const Leader = require('../models/Leader');
const Kid = require('../models/Kid');
const Question = require('../models/Question');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for seeding');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    await Camp.deleteMany({});
    await Subcamp.deleteMany({});
    await Leader.deleteMany({});
    await Kid.deleteMany({});
    await Question.deleteMany({});
    console.log('🗑️ Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

const seedCamps = async () => {
  const camps = [
    {
      name: 'CISV Summer Camp 2024',
      description: 'Trại hè quốc tế CISV 2024 - Kết nối và hiểu biết',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-07-25'),
      location: {
        country: 'Vietnam',
        city: 'Ho Chi Minh',
        venue: 'CISV Camp Center',
        address: '123 Camp Street, District 1'
      },
      status: 'active',
      totalParticipants: 120
    }
  ];

  const createdCamps = await Camp.insertMany(camps);
  console.log(`✅ Created ${createdCamps.length} camps`);
  return createdCamps;
};

const seedSubcamps = async (camps) => {
  const subcamps = [
    {
      name: 'Red Dragons',
      description: 'Đội Rồng Đỏ - Năng động và sáng tạo',
      campId: camps[0]._id,
      color: '#ff4757',
      maxLeaders: 8
    },
    {
      name: 'Blue Eagles',
      description: 'Đội Đại Bàng Xanh - Mạnh mẽ và đoàn kết',
      campId: camps[0]._id,
      color: '#3742fa',
      maxLeaders: 6
    },
    {
      name: 'Green Wolves',
      description: 'Đội Sói Xanh - Thông minh và linh hoạt',
      campId: camps[0]._id,
      color: '#2ed573',
      maxLeaders: 7
    }
  ];

  const createdSubcamps = await Subcamp.insertMany(subcamps);
  console.log(`✅ Created ${createdSubcamps.length} subcamps`);
  return createdSubcamps;
};

const seedLeaders = async (subcamps) => {
  const leaderNames = [
    'Nguyễn Minh Tuấn', 'Trần Thị Lan', 'Lê Văn Hùng', 'Phạm Thị Mai',
    'Hoàng Đức Nam', 'Võ Thị Hoa', 'Đặng Văn Phong', 'Nguyễn Thị Linh',
    'Trịnh Văn Quang', 'Lý Thị Thu', 'Phan Văn Đức', 'Cao Thị Nga',
    'Bùi Văn Tâm', 'Dương Thị Hằng', 'Vũ Văn Kiên', 'Lê Thị Bích',
    'Ngô Văn Thịnh', 'Trần Thị Yến', 'Đinh Văn Long', 'Hồ Thị Kim',
    'Lương Văn Đạt'
  ];

  const leaders = [];
  let nameIndex = 0;

  for (const subcamp of subcamps) {
    const leadersPerSubcamp = Math.floor(Math.random() * 3) + 6; // 6-8 leaders per subcamp

    for (let i = 0; i < leadersPerSubcamp && nameIndex < leaderNames.length; i++) {
      const name = leaderNames[nameIndex];
      leaders.push({
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '').replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a').replace(/[èéẹẻẽêềếệểễ]/g, 'e').replace(/[ìíịỉĩ]/g, 'i').replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o').replace(/[ùúụủũưừứựửữ]/g, 'u').replace(/[ỳýỵỷỹ]/g, 'y').replace(/đ/g, 'd')}@cisv.org`,
        subcampId: subcamp._id,
        nationality: 'Vietnam',
        experience: {
          years: Math.floor(Math.random() * 5) + 1,
          previousCamps: ['Summer Camp 2023'],
          specializations: ['Team Leadership', 'Child Psychology']
        }
      });
      nameIndex++;
    }
  }

  const createdLeaders = await Leader.insertMany(leaders);
  console.log(`✅ Created ${createdLeaders.length} leaders`);
  return createdLeaders;
};

const seedKids = async (leaders, subcamps) => {
  const kidNames = [
    'An', 'Bình', 'Chi', 'Dung', 'Em', 'Phong', 'Giang', 'Hoa', 'Khang', 'Linh',
    'Minh', 'Nam', 'Oanh', 'Phúc', 'Quân', 'Rồng', 'Sơn', 'Tâm', 'Uyên', 'Vân',
    'Xuân', 'Yến', 'Zuy', 'Ái', 'Bảo', 'Cường', 'Đạt', 'Hải', 'Khánh', 'Long',
    'Mai', 'Ngọc', 'Phi', 'Quỳnh', 'Sang', 'Thảo', 'Ước', 'Vũ', 'Ý', 'Zung',
    'Anh', 'Bích', 'Cẩm', 'Diễm', 'Hạnh', 'Kỳ', 'Loan', 'Mơ', 'Nhi', 'Phương'
  ];

  const nationalities = ['Vietnam', 'Japan', 'Korea', 'Thailand', 'Singapore', 'Malaysia', 'Philippines'];
  const kids = [];
  let nameIndex = 0;

  for (const leader of leaders) {
    const kidsPerLeader = Math.floor(Math.random() * 3) + 3; // 3-5 kids per leader
    const subcamp = subcamps.find(s => s._id.equals(leader.subcampId));

    for (let i = 0; i < kidsPerLeader && nameIndex < kidNames.length; i++) {
      kids.push({
        name: kidNames[nameIndex],
        age: Math.floor(Math.random() * 7) + 10, // 10-16 years old
        gender: Math.random() > 0.5 ? 'male' : 'female',
        nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
        subcampId: subcamp._id,
        leaderId: leader._id,
        languages: ['English', 'Vietnamese'],
        interests: ['Sports', 'Music', 'Art'],
        evaluationStatus: {
          isStarted: false,
          isCompleted: false,
          completedQuestions: 0,
          totalQuestions: 0
        }
      });
      nameIndex++;
    }

    // Update leader kids count
    await Leader.findByIdAndUpdate(leader._id, {
      kidsCount: Math.min(kidsPerLeader, kidNames.length - (nameIndex - kidsPerLeader))
    });
  }

  const createdKids = await Kid.insertMany(kids);
  console.log(`✅ Created ${createdKids.length} kids`);
  return createdKids;
};

const seedQuestions = async () => {
  const questions = [
    {
      text: 'Khả năng tham gia hoạt động',
      category: 'participation',
      type: 'both',
      order: 1,
      description: 'Đánh giá mức độ tích cực tham gia các hoạt động của trại'
    },
    {
      text: 'Tinh thần đồng đội và hợp tác',
      category: 'teamwork',
      type: 'both',
      order: 2,
      description: 'Khả năng làm việc nhóm và hỗ trợ các bạn khác'
    },
    {
      text: 'Khả năng lãnh đạo và sáng kiến',
      category: 'leadership',
      type: 'both',
      order: 3,
      description: 'Thể hiện khả năng dẫn dắt và đưa ra ý tưởng mới'
    },
    {
      text: 'Giao tiếp và kỹ năng xã hội',
      category: 'communication',
      type: 'both',
      order: 4,
      description: 'Cách giao tiếp với bạn bè và người lớn'
    },
    {
      text: 'Thái độ và hành vi tích cực',
      category: 'behavior',
      type: 'both',
      order: 5,
      description: 'Thái độ chung và hành vi trong suốt trại'
    }
  ];

  const createdQuestions = await Question.insertMany(questions);
  console.log(`✅ Created ${createdQuestions.length} questions`);
  return createdQuestions;
};

const updateSubcampStats = async (subcamps, kids) => {
  for (const subcamp of subcamps) {
    const subcampKids = kids.filter(kid => kid.subcampId.equals(subcamp._id));

    await Subcamp.findByIdAndUpdate(subcamp._id, {
      totalKids: subcampKids.length,
      currentLeaders: await Leader.countDocuments({ subcampId: subcamp._id })
    });
  }
  console.log('✅ Updated subcamp statistics');
};

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    await connectDB();
    await clearDatabase();

    const camps = await seedCamps();
    const subcamps = await seedSubcamps(camps);
    const leaders = await seedLeaders(subcamps);
    const kids = await seedKids(leaders, subcamps);
    const questions = await seedQuestions();

    await updateSubcampStats(subcamps, kids);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${camps.length} camps`);
    console.log(`- ${subcamps.length} subcamps`);
    console.log(`- ${leaders.length} leaders`);
    console.log(`- ${kids.length} kids`);
    console.log(`- ${questions.length} questions`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
