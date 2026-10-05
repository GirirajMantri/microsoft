const fs = require('fs');
let c = fs.readFileSync('d:/microsoft_hack/frontend/components/nexus/CoreScene.tsx', 'utf8');
c = c.replace('<Canvas\r\n', '<Canvas style={{ touchAction: "auto" }}\r\n');
c = c.replace('<Canvas\n', '<Canvas style={{ touchAction: "auto" }}\n');
fs.writeFileSync('d:/microsoft_hack/frontend/components/nexus/CoreScene.tsx', c);
