import React, { useState } from 'react';
import { styled } from '@mui/system';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Card,
  CardContent,
  Snackbar,
  TableContainerProps,
} from '@mui/material';
;

interface PropertyDataItem {
  GroupName: string;
  pLabel: string;
  pValue: string;
  PName:string,
  PropertyValue:string
}

interface PropertyTableProps {
  propertyData?: PropertyDataItem[];
  stencilResponse?: string;
}

const StyledPropertyCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#778899',
  marginTop: '20px',
  borderRadius: '8px',
  color: 'white',
  fontSize: '12px',
  fontFamily: 'Segoe UI, sans-serif',
  [theme.breakpoints.down('sm')]: {
    marginTop: '10px',
    padding: '10px',
  },
}));

const StyledTableContainer = styled(TableContainer)<TableContainerProps>({
  width: '100%',
  backgroundColor: '#4e88c9',
  borderRadius: '8px',
  overflow: 'hidden',
  fontFamily: 'Segoe UI, sans-serif',
  fontSize: '12px',
});

const StyledTableCellHeader = styled(TableCell)({
  backgroundColor: '#EFEFEF',
  padding: '10px 16px',
  fontWeight: 'bold',
  color: '#333',
  border: '1px solid #778899',
  textAlign: 'left',
  fontSize: '12px',
  fontFamily: 'Segoe UI, sans-serif',
});

const StyledTableCellBody = styled(TableCell)({
  backgroundColor: '#778899',
  padding: '7px 10px',
  border: '1px solid #ffffff',
  color: 'var(--font-color)',
  position: 'relative',
  textAlign: 'left',
  fontSize: '12px',
  fontFamily: 'Segoe UI, sans-serif',
});

const StyledTableRow = styled(TableRow)({
  '&:hover': {
    backgroundColor: '#ffffff',
  },
  fontSize: '12px',
  fontFamily: 'Segoe UI, sans-serif',
});

const PropertyTable: React.FC<PropertyTableProps> = ({
  propertyData = [],
  stencilResponse = '',
}) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    console.log('Copied to clipboard:', text);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        className='snackbar'
        message={<span className="snackbar-message">Content copied to clipboard</span>}
        ContentProps={{
          className: 'snackbar-content',
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <StyledPropertyCard>
        <CardContent>
          <StyledTableContainer component={Paper}>
            <Table>
              <TableBody>
                {propertyData.map((item, index) => (
                  <StyledTableRow key={index} className="styled-table-row">
                    <StyledTableCellHeader component="th" scope="row">
                      {item.PName}
                    </StyledTableCellHeader>
                    <StyledTableCellBody>
                      {item.PropertyValue}
                      <div
                        className="copy-icon-wrapper"
                        onClick={() => copyToClipboard(item.PropertyValue)}
                      >
                        <img
                          src="/assets/Icons/Copy.svg"
                          alt="Copy Icon"
                        />
                      </div>
                    </StyledTableCellBody>
                  </StyledTableRow>
                ))}
                <StyledTableRow className="styled-table-row">
                  <StyledTableCellHeader component="th" scope="row">
                    Stencil
                  </StyledTableCellHeader>
                  <StyledTableCellBody>
                    {stencilResponse}
                    <div
                      className="copy-icon-wrapper"
                      onClick={() => copyToClipboard(stencilResponse)}
                    >
                      <img
                        src="/assets/Icons/Copy.svg"
                        alt="Copy Icon"
                      />
                    </div>
                  </StyledTableCellBody>
                </StyledTableRow>
              </TableBody>
            </Table>

          </StyledTableContainer>
        </CardContent>
      </StyledPropertyCard>
    </>
  );
};

export default PropertyTable;
