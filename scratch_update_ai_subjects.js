const fs = require('fs');

let c = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/server.js', 'utf8');

const match = c.match(/const SUBJECT_CATALOG = (\[[\s\S]*?\]);/);
if (match) {
  let catalog = eval(match[1]);
  // Remove existing AI subjects from semester 1, 2, 3
  catalog = catalog.filter(s => s.semester > 3);
  
  const newSem1to3 = [
    {code: '23MAT106', name: 'Mathematics for Intelligent Systems 1', branch: 'AI', semester: 1},
    {code: '23PHY104', name: 'Computational Mechanics 1', branch: 'AI', semester: 1},
    {code: '23AID101', name: 'Computational Thinking', branch: 'AI', semester: 1},
    {code: '23AID102', name: 'Elements of Computing - 1', branch: 'AI', semester: 1},
    {code: '23EEE103', name: 'Introduction to Electrical Engineering', branch: 'AI', semester: 1},
    {code: '23BIO112', name: 'Introduction to Biological Data', branch: 'AI', semester: 1},
    {code: '22ADM101', name: 'Foundations of Indian Heritage', branch: 'AI', semester: 1},
    {code: '22AVP103', name: 'Mastery Over Mind', branch: 'AI', semester: 1},
    {code: '19ENG111', name: 'Technical Communication', branch: 'AI', semester: 1},
    
    {code: '23MAT112', name: 'Mathematics for Intelligent Systems 2', branch: 'AI', semester: 2},
    {code: '23PHY114', name: 'Computational Mechanics 2', branch: 'AI', semester: 2},
    {code: '23AID111', name: 'Object Oriented Programming', branch: 'AI', semester: 2},
    {code: '23AID112', name: 'Data Structures & Algorithms', branch: 'AI', semester: 2},
    {code: '23AID113', name: 'Elements of Computing 2', branch: 'AI', semester: 2},
    {code: '23ECE113', name: 'Introduction to Electronics', branch: 'AI', semester: 2},
    {code: '23CHY115', name: 'Introduction to Materials Informatics', branch: 'AI', semester: 2},
    {code: '22ADM111', name: 'Glimpses of glorious India', branch: 'AI', semester: 2},
    
    {code: '23MAT204', name: 'Mathematics for Intelligent Systems 3', branch: 'AI', semester: 3},
    {code: '23AID201', name: 'Modelling, Simulation & Analysis', branch: 'AI', semester: 3},
    {code: '23AID202', name: 'Introduction to Robotics', branch: 'AI', semester: 3},
    {code: '23AID203', name: 'Software-Defined Communication Systems', branch: 'AI', semester: 3},
    {code: '23AID204', name: 'Advanced Data Structures & Algorithm Analysis', branch: 'AI', semester: 3},
    {code: '23AID205', name: 'Introduction to AI and Machine Learning', branch: 'AI', semester: 3},
    {code: '23AID206', name: 'Introduction to Computer Networks', branch: 'AI', semester: 3},
    {code: '23AVP201', name: 'Amrita Value Programme I', branch: 'AI', semester: 3},
    {code: '23LSE201', name: 'Life Skills for Engineers I', branch: 'AI', semester: 3}
  ];
  
  catalog = [...newSem1to3, ...catalog];
  c = c.replace(match[0], 'const SUBJECT_CATALOG = ' + JSON.stringify(catalog, null, 2) + ';');
  fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/server.js', c);
  console.log('Catalog updated successfully!');
} else {
  console.log('Could not find catalog in server.js');
}
