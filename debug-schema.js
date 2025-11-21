// Debug script to find undefined validators in Convex schema
const fs = require('fs');
const path = require('path');

const schemaModules = [
  './convex/schema/yourobc/accounting/schemas.ts',
  './convex/schema/yourobc/couriers/schemas.ts',
  './convex/schema/yourobc/customerMargins/schemas.ts',
  './convex/schema/yourobc/customers/schemas.ts',
  './convex/schema/yourobc/dashboard/schemas.ts',
  './convex/schema/yourobc/employeeCommissions/schemas.ts',
  './convex/schema/yourobc/employeeKPIs/schemas.ts',
  './convex/schema/yourobc/employeeSessions/schemas.ts',
  './convex/schema/yourobc/employees/schemas.ts',
  './convex/schema/yourobc/invoices/schemas.ts',
  './convex/schema/yourobc/partners/schemas.ts',
  './convex/schema/yourobc/quotes/schemas.ts',
  './convex/schema/yourobc/shipments/schemas.ts',
  './convex/schema/yourobc/statistics/schemas.ts',
  './convex/schema/yourobc/supporting/schemas.ts',
  './convex/schema/yourobc/tasks/schemas.ts',
  './convex/schema/yourobc/trackingMessages/schemas.ts',
];

console.log('Checking schema files for undefined validators...\n');

schemaModules.forEach(filePath => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath, 'utf8');

    // Check for common undefined validator patterns
    const patterns = [
      { regex: /v\.\w+\s*:\s*undefined/g, desc: 'undefined as validator value' },
      { regex: /export\s+const\s+\w+\s*=\s*undefined/g, desc: 'exported undefined constant' },
      { regex: /import\s+{[^}]*undefined[^}]*}/g, desc: 'undefined in imports' },
      { regex: /:\s*v\.\w+,\s*$/gm, desc: 'trailing comma after validator (possible missing value)' },
    ];

    patterns.forEach(({ regex, desc }) => {
      const matches = content.match(regex);
      if (matches) {
        console.log(`⚠️  ${filePath}`);
        console.log(`   Issue: ${desc}`);
        matches.forEach(match => {
          const lines = content.substring(0, content.indexOf(match)).split('\n');
          console.log(`   Line ${lines.length}: ${match.trim()}`);
        });
        console.log('');
      }
    });

  } catch (err) {
    console.log(`❌ Error reading ${filePath}: ${err.message}`);
  }
});

console.log('\nDone checking schema files.');
