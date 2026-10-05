const fs = require('fs');
let c = fs.readFileSync('d:/microsoft_hack/frontend/components/nexus/CoreScene.tsx', 'utf8');
c = c.replace(/<Html center distanceFactor=\{9\} zIndexRange=\{\[5, 0\]\}>[\s\S]*?<\/Html>/, '<Text position={[0, -0.4, 0]} fontSize={0.15} color="rgba(255,255,255,0.7)" letterSpacing={0.2}>{label.toUpperCase()}</Text>');
fs.writeFileSync('d:/microsoft_hack/frontend/components/nexus/CoreScene.tsx', c);
