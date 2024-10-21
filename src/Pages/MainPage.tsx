import React, { useEffect, useMemo, useState } from 'react';
import { Box, TextField, Typography, CircularProgress, Snackbar, } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import data from '../Link.json'
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import useTheme from '../Components/Theme';
import axios from 'axios';
import { Alert, Dialog, DialogActions, Radio, RadioGroup, DialogContent, DialogTitle, FormGroup, Checkbox, Button, SelectChangeEvent } from '@mui/material';
import { Search,transformToRcTreeData} from '../Common/CommonFunctions'
import Treedata from './TreeData';
import Setting from './Setting';
import BASE_URL from '../Config/Config';

interface Manufacturer {
  mfgAcronym: string;
  manufacturer  : string
}

interface EqType {
  eqtype: string,
}



const SearchComponent = () => {

  const [loading, setLoading] = useState<boolean>(false);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [eqTypes, setEqTypes] = useState<EqType[]>([]);
  const [selectedEqType, setSelectedEqType] = useState<string>('');
  const [productLine, setProductLine] = useState<string[]>([]);
  const [selectedProductLine, setSelectedProductLine] = useState<string>('');
  const [productNumber, setProductNumber] = useState<string[]>([]);
  const [selectedProductNumber, setSelectedProductNumber] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [dtManufacturers, setDtManufacturers] = useState<Manufacturer[]>([]);
  const [selectedDtManufacturers, setSelectedDtManufacturers] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [showTreeComponent, setShowTreeComponent] = useState<boolean>(false);
  const [kwdSearchType, setKwdSearchType] = useState<string>('0');
  const [showSetting, setShowSetting] = useState<boolean>(false);
  const [selectedManufacturerDetails, setSelectedManufacturerDetails] = useState<any>();


  const handleKwdSearchTypeChange = (event: any) => {
    setKwdSearchType(event.target.value);
  };

  const searchParams = useMemo(() => ({
    keyword,
    kwdSearchType,
    selectedManufacturer,
    selectedEqType,
    selectedProductLine,
    selectedProductNumber,
    selectedDtManufacturers,
    selectedManufacturerDetails
  }), [ kwdSearchType, selectedManufacturer, selectedEqType, selectedProductNumber, selectedDtManufacturers]);

  const onSuccess = (resultData: any[]) => {
    setLoading(false)

    // if (dtResultdata && dtResultdata.length > 0) {
// console.log(resultData)
//       setDtManufacturers(dtResultdata);
//       setIsDialogOpen(true);
//       return;
    // }

    if (resultData && resultData.length > 0) {
      const treeHierarchy = transformToRcTreeData(resultData);
      console.log('treeHierarchy:', treeHierarchy);
      setTreeData(treeHierarchy);


      if (treeHierarchy.length > 0) {
        setShowTreeComponent(true);
      } else {
        setSnackbarMessage('No relevant tree data found');
        setSnackbarOpen(true);
        setShowTreeComponent(false);
      }
    } else {
      setSnackbarMessage('No results found');
      setSnackbarOpen(true);
      setShowTreeComponent(false);
    }
  };

  const onError = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // Fetch Manufacturer 

    let getsessionId = sessionStorage.getItem("sessionID")
    console.log('sessionid', getsessionId)
    
  useEffect(() => {
    const fetchManufacturers = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${BASE_URL}get_mfg`, {
          customerID: 0,
          customerName:"",
          sessionId: getsessionId
        });
        const manufacturersData = response.data.data;
        setManufacturers(manufacturersData);

        if (manufacturersData.length === 1) {
          setSelectedManufacturer(manufacturersData[0].mfgAcronym);
        }
      } catch (error) {
        console.error('Error fetching manufacturers:', error);
      }
      setLoading(false);
    };
    fetchManufacturers();
  }, [getsessionId]);

  // Fetch Equipment Types based on Manufacturer
  useEffect(() => {
    if (selectedManufacturer) {
      const fetchEqTypes = async () => {
        setLoading(true);
        try {
          const response = await axios.post(`${BASE_URL}get_eqtype`, {
            actualMfgAcronym:selectedManufacturer,
            customerID: 0,
            customerName:"",
            includeRelatedMfg:false,
            sessionId: getsessionId

          });
          const eqTypesData = response.data.data;
          setEqTypes(eqTypesData);

          // Automatically select if only one equipment type is available
          if (eqTypesData.length === 1) {
            setSelectedEqType(eqTypesData[0].eqType);
          }
        } catch (error) {
          console.error('Error fetching equipment types:', error);
        }
        setLoading(false);
      };
      fetchEqTypes();
    }
  }, [selectedManufacturer]);

  // Fetch Product line based on Manufacturer and Eq Types
  // useEffect(() => {
  //   if (selectedManufacturer && selectedEqType) {
  //     const fetchProductLine = async () => {
  //       setLoading(true);
  //       try {
  //         const response = await axios.post(`${BASE_URL}/GetLibraryAvailableProdLinesNew`, {
  //           Email: "",
  //           SubNo: "000000000000000000001234",
  //           ActualMfgAcronym: selectedManufacturer,
  //           EqTypeToGetFor: selectedEqType,
  //           FullLibrary: false,
  //         });
  //         const productLineData = response.data.Data;
  //         setProductLine(productLineData);

  //         // Automatically select if only one product line is available
  //         if (productLineData.length === 1) {
  //           setSelectedProductLine(productLineData[0]);
  //         }
  //       } catch (error) {
  //         console.error('Error fetching product line:', error);
  //       }
  //       setLoading(false);
  //     };
  //     fetchProductLine();
  //   }
  // }, [selectedManufacturer, selectedEqType]);

  // Fetch Product number based on Manufacturer, Eq Types & Product Line 
  useEffect(() => {
    if (selectedManufacturer && selectedEqType) {
      const fetchProductNumber = async () => {
        setLoading(true);
        try {
          const response = await axios.post(`${BASE_URL}get_prodno`, {
            actualMfgAcronym: selectedManufacturer,
            customerID: 0,
            customerName: "",
            eqtype: selectedEqType,
            includeRelatedMfg: false,
            prodLine: "",
            sessionId: getsessionId,
          });
          const productNumberData = response.data.data;
          console.log("productNo", productNumberData);
          setProductNumber(productNumberData);
  
          // Automatically select if only one product number is available
          if (productNumberData.length === 1) {
            const firstProdNo = productNumberData[0].mfgProdNo;
            setSelectedProductNumber(firstProdNo);
          }
        } catch (error) {
          console.error("Error fetching product number:", error);
        }
        setLoading(false);
      };
      fetchProductNumber();
    }
  }, [selectedManufacturer, selectedEqType]);
  


  // get manufacturer if keyword match 
  useEffect(() => {
    if (keyword) {
      const matchedManufacturers = manufacturers.filter((manufacturer) =>
        manufacturer.mfgAcronym.toLowerCase().includes(keyword.toLowerCase())
      );
      if (matchedManufacturers.length > 0) {
        console.log('Matched Manufacturers:', matchedManufacturers);
      } else {
        console.log('No matching manufacturers found');
      }
    }

  }, [keyword, manufacturers]);

  //if all selected then auto search as per selected 

  useEffect(() => {
    if (selectedManufacturer && selectedEqType && selectedProductNumber) {
      Search(searchParams, onSuccess, onError)
    }
  }, [selectedManufacturer, selectedEqType , selectedProductNumber,searchParams])


  const handleManufacturerChange = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value;
    setSelectedManufacturer(selectedValue);
  
    const manufacturerDetails = manufacturers.find(manufacturer => manufacturer.mfgAcronym === selectedValue);
    let selectedmanufacturerdetails = manufacturerDetails?.manufacturer
    setSelectedManufacturerDetails(selectedmanufacturerdetails);
    
    // Reset dependent states
    setSelectedEqType('');
    setSelectedProductLine('');
    setSelectedProductNumber('');
    setEqTypes([]);
    setProductLine([]);
    setProductNumber([]);
  };

  const handleEqTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedEqType(event.target.value);
    setSelectedProductLine('')
    setSelectedProductNumber('')
    setProductLine([])
    setProductNumber([])

  }
  const handleproductlinechange = (event: SelectChangeEvent<string>) => {
    setSelectedProductLine(event.target.value)
    setSelectedProductNumber('')
    setProductNumber([])

  }
  const handleproductnumber = (event: SelectChangeEvent<string>) => {
    setSelectedProductNumber(event.target.value)

  }

  const handleSettingClick = () => {
    setShowSetting(true)
  };

  const backfromsetting = () => {
    setShowSetting(false)
  }
  const handleClick = () => {
    window.open(data.logourl, '_blank');
  };


  const handleManufacturerSelection = (manufacturer: string) => {
    setSelectedDtManufacturers((prevSelected) =>
      prevSelected.includes(manufacturer)
        ? prevSelected.filter((item) => item !== manufacturer)
        : [...prevSelected, manufacturer]
    );
  };

  const handleDialogSubmit = () => {
    console.log('Selected Manufacturers:', selectedDtManufacturers);
    setIsDialogOpen(false);
    setSelectedDtManufacturers([])
    handlesearch()
  };

  const handledialogclose = () => {
    setIsDialogOpen(false)
    setSelectedDtManufacturers([])
  }

  const handlebuttonclick = () => {
    setSnackbarOpen(false)
  }
  useTheme(data.colortheme)

  const handleSnackbarClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };
  const handlesearch = () => {
    setLoading(true)
    Search(searchParams, onSuccess, onError);
    setLoading(false)
  };

  const handleBackClick = () => {
    setShowTreeComponent(false);
  };
  return (
    <div className='main-page'>

      <Backdrop
        className='backdrop'
        open={loading}
      >
        <CircularProgress className='circular-progress' />
      </Backdrop>

      <Dialog open={isDialogOpen} onClose={handledialogclose} className="dialog">
        <DialogTitle className="dialog-title">Select Manufacturers</DialogTitle>
        <DialogContent className="dialog-content">
          <FormControl component="fieldset" className="form-control">
            <FormGroup className="form-group">
              {dtManufacturers.map((manufacturer, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={selectedDtManufacturers.includes(manufacturer.mfgAcronym)}
                      onChange={() => handleManufacturerSelection(manufacturer.mfgAcronym)}
                    />
                  }
                  label={manufacturer.manufacturer}
                  className="form-control-label"
                />
              ))}
            </FormGroup>
          </FormControl>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handledialogclose}>Cancel</Button>
          <Button onClick={handleDialogSubmit}>OK</Button>
        </DialogActions>
      </Dialog>
      {!showTreeComponent && !showSetting ? (

        <>
          <Box className="box-container">
            <Box className="icon-container">
              <>
                <img
                  src="./assets/Icons/NetZoom_Settings_128x128.svg"
                  alt=""
                  title="Setting"
                  className="icon"
                  onClick={handleSettingClick}
                />
                <Typography className="visit-text">Visit</Typography>
                <Typography
                  title="Visit VisioStencil website"
                  className="link-text"
                  onClick={handleClick}
                >
                  VisioStencils.com
                </Typography>
              </>
            </Box>
          </Box>

          <Box
            component="form"
            className='form-box'
            noValidate
          >
            <div className='search-input-container'>
              <div className='search-field-wrapper'>
                <TextField
                  id="outlined-basic"
                  label="Search"
                  value={keyword}
                  className="nz-searchcombo search-lbl custom-text-field"
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="By keyword"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && keyword.trim() !== '') {
                      handlesearch();
                    }
                  }}
                  fullWidth
                />

                {keyword ? (
                  <Snackbar
                    open={snackbarOpen}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  >
                    <Alert
                      onClose={handleSnackbarClose}
                      severity="info"
                      sx={{ width: '100%' }}
                      action={
                        <Button color="inherit" size="small" onClick={handlebuttonclick}>
                          OK
                        </Button>
                      }>

                      {snackbarMessage}
                    </Alert>
                  </Snackbar>
                ) : (
                  <Snackbar
                    open={snackbarOpen}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  >
                    <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
                      {snackbarMessage}
                    </Alert>
                  </Snackbar>
                )}
              </div>
              <div className='search-icon' >
                <img
                  src="./assets/Icons/Search_128x128.svg"
                  alt="Search"
                  onClick={() => !loading && handlesearch()}
                  className='search-icon'
                />
              </div>
            </div>
            <div className="form-container">
              <FormControl component="fieldset" className="form-control">
                <RadioGroup
                  row
                  className="radio-group"
                  onChange={handleKwdSearchTypeChange}
                  value={kwdSearchType}
                >
                  <FormControlLabel
                    className="form-control-label"
                    control={<Radio className="radio" id='radio' value="0" />}
                    label="Any Word"
                  />
                  <FormControlLabel
                    control={<Radio className="radio" id='radio' color="default" value="1" />}
                    label="All Words"
                  />
                </RadioGroup>
              </FormControl>
            </div>


            <FormControl variant='outlined' >
              <InputLabel className='select-label' shrink> Manufacturers  [{manufacturers.length}]</InputLabel>
              <Select
                displayEmpty
                value={selectedManufacturer}
                onChange={handleManufacturerChange}
                className='nz-searchcombo'

                input={<OutlinedInput label={`Manufacturers[${manufacturers.length}]`}
                  className='select-input'
                />}
                MenuProps={{
                  PaperProps: {
                    className: 'select-dropdown', 
        
                  },
                }}
                renderValue={(selected: string) => {
                  if (!selected) {
                    return <h1 className='default-all'>All</h1>
                  }
                  const selectedManufacturer = manufacturers.find(manufacturer => manufacturer.mfgAcronym === selected);
                  return selectedManufacturer ? selectedManufacturer.manufacturer : 'All';
                }}
              >
                {manufacturers.length > 0 && (<MenuItem value="" className="select-menu-item" ><h1>All</h1></MenuItem>)}
                {manufacturers.length > 0 ? (
                  manufacturers.map((manufacturer) => (
                    <MenuItem key={manufacturer.mfgAcronym} value={manufacturer.mfgAcronym}
                      className="select-menu-item"
                    >
                      {manufacturer.manufacturer}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled className="select-menu-item">No Manufacturers</MenuItem>
                )}
              </Select>

            </FormControl>


            <FormControl fullWidth variant="outlined" sx={{ mt: 2, height: 'auto' }}>
              <InputLabel className='select-label' shrink>
                Equipment Types [{eqTypes.length}]
              </InputLabel>
              <Select
                displayEmpty
                value={selectedEqType}
                className='nz-searchcombo'
                onChange={handleEqTypeChange}
                input={
                  <OutlinedInput
                    notched
                    label={`Equipment Types [${eqTypes.length}]`}
                    className='select-input'
                  />
                }
                renderValue={(selected) => {
                  if (!selected) {
                    return <h1 className="select-menu-item">All</h1>;
                  }
                  return selected as string;
                }}
                MenuProps={{
                  PaperProps: {
                    className: 'select-dropdown', 
        
                  },
                }}
              >
                {eqTypes.length > 0 && (
                  <MenuItem value="">
                    <h1 className="select-menu-item">All</h1>
                  </MenuItem>
                )}
                {eqTypes.length > 0 ? (
                  eqTypes.map((eqtype: any) => (
                    <MenuItem
                      key={eqtype.eqType}
                      value={eqtype.eqType}
                      className="select-menu-item"
                    >
                      {eqtype.eqType}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled className="select-menu-item">
                    No Equipment Types Available
                  </MenuItem>
                )}
              </Select>
            </FormControl>


            {/* <FormControl fullWidth variant="outlined" sx={{ mt: 2, height: 'auto' }}>
              <InputLabel
                className='select-label'
                shrink
              >
                ProductLines [{productLine.length}]
              </InputLabel>
              <Select
                displayEmpty
                value={selectedProductLine}
                className='nz-searchcombo'
                onChange={handleproductlinechange}
                input={<OutlinedInput notched label=" Product Lines [0]"
                  className='select-input'
                />}

                renderValue={(selected) => {
                  if (!selected) {
                    return <h1 className='default-all'>All</h1>
                  }
                  return selected as string
                }}
                MenuProps={{
                  PaperProps: {
                    className: 'select-dropdown-Pnumber', 
        
                  },
                }}
              >
                {productLine.length > 0 && (

                  <MenuItem value="">
                    <h1 className="select-menu-item">All</h1>
                  </MenuItem>
                )}
                {productLine.length > 0 ? (
                  productLine.map((productLine: any) => (
                    <MenuItem key={productLine} value={productLine} className="select-menu-item">
                      {productLine}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled className="select-menu-item">No product line available</MenuItem>
                )}
              </Select>
            </FormControl> */}


            <FormControl fullWidth variant="outlined" sx={{ mt: 2, height: 'auto' }}>
              <InputLabel
                className='select-label'
                shrink
              >
                Product Numbers [{productNumber.length}]
              </InputLabel>
              <Select
                displayEmpty
                value={selectedProductNumber}
                onChange={handleproductnumber}
                className='nz-searchcombo'
                input={<OutlinedInput notched label="Product Numbers [0]"
                  className='select-input'
                />}
                renderValue={(Pnumberselected) => {
                  if (!Pnumberselected) {
                    return <h1>All</h1>
                  }
                  return Pnumberselected as string
                }}
                MenuProps={{
                  PaperProps: {
                    className: 'select-dropdown-Pno', 
                  },
                }}
              >
                {productNumber.length > 0 && (

                  <MenuItem value="">
                    <h1 className="select-menu-item">All</h1>
                  </MenuItem>
                )}
                {productNumber.length > 0 ? (
                  productNumber.map((pnumber: any,index) => (
                    <MenuItem key={pnumber.mfgProdNo} value={pnumber.mfgProdNo} className="select-menu-item">
                      {pnumber.mfgProdNo}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled className="select-menu-item">No Product number Available</MenuItem>
                )}
              </Select>
            </FormControl>


          </Box>

          <Typography
            className='typography-title'
          >
            Now you can create professional quality Visio Diagrams and PowerPoint Presentations using High Quality Shapes and Stencils.
          </Typography>
        </>

      ) : showSetting ? (
        <>
          <Box className='render-container-mainpage'>
            <Box className='box-container'>
              <Box className='icon-container'>
                <img
                  src="./assets/Icons/Left_128x128.svg"
                  alt="Back"
                  onClick={backfromsetting}
                  title='Back'
                  className='icon'
                />

                <Typography className='visit-text'>Visit</Typography>
                <Typography
                  title="Visit VisioStencil website"
                  className='link-text'
                  onClick={handleClick}>
                  VisioStencils.com
                </Typography>
              </Box>
            </Box>
          </Box>
          <Setting />
        </>

      ) : (
        <Box
          className='render-container-mainpage'
          display={showTreeComponent ? 'block' : 'none'}
        >
          {showTreeComponent && treeData.length > 0 ? (
            <>
              <Box className='box-container'>
                <Box className='icon-container'>
                  <img
                    src="./assets/Icons/Left_128x128.svg"
                    alt="Back"
                    onClick={handleBackClick}
                    title='Back'
                    className="icon"
                  />

                  <Typography className='visit-text'>Visit</Typography>
                  <Typography
                    title="Visit VisioStencil website"
                    className="link-text"
                    onClick={handleClick}>
                    VisioStencils.com
                  </Typography>
                </Box>
              </Box>
              <Treedata treeData={treeData} />
            </>
          ) : (
            <div>No data available for the tree.</div>
          )}
        </Box>
      )}
    </div>
  );
}
export default SearchComponent
