import { AvatarCreator } from '@readyplayerme/react-avatar-creator';
import { useNavigate } from 'react-router-dom';

const Avtar3D = () => {
  const navigate = useNavigate();

  const config = {
    bodyType: 'fullbody',
    gender: 'neutral',
    language: 'en',
    frameApi: true,
    quickStart: true,
    clearCache: true,
    redirectUrl: '' // We'll use `onAvatarExported` for handling avatar export
  };

  const handleAvatarExport = (event) => {
    const avatarUrl = event?.data?.url; // Safely get the URL from event

    if (avatarUrl) {
      // Save the avatar URL to localStorage (or state if using React context)
      localStorage.setItem('avatarModelUrl', avatarUrl);
      navigate('/view-avatar'); // Redirect to the avatar display page
    } else {
      console.error('Avatar export failed: No URL received.');
      // Optionally show an error message to the user here
    }
  };

  return (
    <AvatarCreator
      subdomain="your-subdomain" // Replace with your actual subdomain
      editorConfig={config}
      onAvatarExported={handleAvatarExport} // Listen for avatar export
      style={{ height: '600px', width: '100%' }}
    />
  );
};

export default Avtar3D;
