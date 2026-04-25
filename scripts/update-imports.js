const fs = require('fs');
const path = require('path');

const mappings = [
  // Leagues
  { from: /@\/schemas\/leagueSchema/g, to: '@/features/leagues/schemas/leagueSchema' },
  { from: /@\/types\/league/g, to: '@/features/leagues/types/league' },
  { from: /@\/types\/standings/g, to: '@/features/leagues/types/standings' },
  // Players
  { from: /@\/schemas\/playerSchema/g, to: '@/features/players/schemas/playerSchema' },
  { from: /@\/types\/player/g, to: '@/features/players/types/player' },
  // Teams
  { from: /@\/schemas\/teamSchema/g, to: '@/features/teams/schemas/teamSchema' },
  { from: /@\/types\/team/g, to: '@/features/teams/types/team' },
  // Tournaments
  { from: /@\/schemas\/tournamentSchema/g, to: '@/features/tournaments/schemas/tournamentSchema' },
  { from: /@\/types\/tournament/g, to: '@/features/tournaments/types/tournament' },
  { from: /@\/types\/match/g, to: '@/features/tournaments/types/match' }
];

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

const targetDirs = ['app', 'components', 'features', 'services'];

targetDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    walk(fullPath, (filePath) => {
        if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
        
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content;
        
        mappings.forEach(m => {
            newContent = newContent.replace(m.from, m.to);
        });
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated: ${filePath}`);
        }
    });
});
