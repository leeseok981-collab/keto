import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const hacksState = `
  const [showHackInput, setShowHackInput] = useState(false);
  const [hackInputValue, setHackInputValue] = useState('');
  const [showHackWarning, setShowHackWarning] = useState(false);
  
  const [showExecutorInput, setShowExecutorInput] = useState(false);
  const [executorInputValue, setExecutorInputValue] = useState('');

  const handleHackSubmit = () => {
      if (hackInputValue === "OWNER (:Permissions/Input Status: Nuclear Program Cat-'[\\\\Gen-L:)") {
          setShowHackInput(false);
          setShowHackWarning(true);
      } else {
          alert('Access Denied');
          setShowHackInput(false);
      }
      setHackInputValue('');
  };

  const grantOwner = () => {
      localStorage.setItem('secretOwner', 'true');
      window.location.reload();
  };
`;

const stateInsertIndex = code.indexOf("const isOwner = user?.email === 'leeseok981@gmail.com';");
if (stateInsertIndex !== -1) {
    code = code.substring(0, stateInsertIndex) + hacksState + "\n  " + code.substring(stateInsertIndex);
}

// Re-patch isOwner
code = code.replace(
    /const isOwner = user\?\.email === 'leeseok981@gmail\.com';/,
    "const isOwner = user?.email === 'leeseok981@gmail.com' || localStorage.getItem('secretOwner') === 'true';"
);

// We need to add handleHackSubmit to the hack input UI since it wasn't added because it was in the state block
// Check if handleHackSubmit is used in the UI
// In setup_modals_and_hacks.mjs I added:
// onKeyDown={e => e.key === 'Enter' && handleHackSubmit()}

fs.writeFileSync('src/App.tsx', code);
console.log("All hacks and executor states added.");
