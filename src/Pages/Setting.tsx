import data from '../Link.json';
import { Typography, Box, Link, TextField, Button } from '@mui/material';
import useTheme from '../Components/Theme';
import '../index.css'

const Setting = () => {
  useTheme(data.colortheme);

  return (
    <div className='setting-container'>
      <Box className="setting-box">
        <Typography className="setting-text">
          The NetZoom device library contains the latest devices from over 5000 manufacturers. 
          To access the full library, you must purchase a subscription at 
          <Link href="https://www.VisioStencils.com" className="setting-link">  www.VisioStencils.com </Link> 
          and register it at the Service portal  
          <Link href="https://Service.NetZoom.com" className="setting-link" > https://Service.NetZoom.com </Link>.
        </Typography>
        
        <TextField
          label="Portal Login Email"
          variant="outlined"
          placeholder="Email address registered at service portal"
          className="custom-textfield"
          fullWidth
          autoComplete="off"

        />
        
        <TextField
          label="Subscription Number"
          variant="outlined"
          placeholder="Enter Purchased Subscription number"
          className="custom-textfield"
          fullWidth
          autoComplete="off"
        />
         <Button
        variant="contained"
        size="small"
        className="custom-button"
      >
        Save
      </Button>
      </Box>

     
    </div>
  );
}

export default Setting;
