import React, { useState } from 'react';

import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import { MenuItem, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

// First time with material ui --
// should wrap in a theme provider moving forward
const CssTextField = withStyles({
  root: {
    '& .MuiInput-underline': {
      marginLeft: 8,
      marginBottom: 14,
      borderColor: 'white',
      color: 'white',
      border: 'none',
      width: 120,
    },
    '& .MuiInput-underline .MuiInputBase-input': {
      color: 'white',
    },
    '& label': {
      color: 'white',
    },
    '& label.MuiFormLabel-filled': {
      color: '#f50057',
    },
    '& label.Mui-focused': {
      color: '#f50057',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#f50057',
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: 'transparent',
    },
    '& .MuiInput-underline:hover': {
      borderBottomColor: 'white',
    },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
      borderBottomColor: 'white',
    },
    '& svg': {
      fill: 'white',
    },
  },
})(TextField);

export enum FilterChipTypes {
  FILE = 'File',
  DIRECTORY = 'Directory',
}

export enum FilterChipInputTypes {
  TEXT = 'text',
  NUMBER = 'number',
  DROPDOWN = 'dropdown',
}

export interface FilterChipProps {
  color?: 'primary' | 'secondary' | 'default' | undefined;
  title: string;
  type: FilterChipInputTypes;
  // values needed for dropdown
  selectValues?: string[];
  handleValueChange: (value: number | string | undefined) => void;
  handleDelete?: (title: string) => void;
  value: string | number | undefined;
}

/**
 * Chip with input
 * Supports numbers, text, and dropdown
 * @param props FilterChipProps
 * @returns Filter Chip JSX
 */
const FilterChip = (props: FilterChipProps) => {
  const { color, title, type, selectValues, handleValueChange, handleDelete } =
    props;
  const [value, setValue] = useState<string | number>();

  const handleChange = (newValue: number | string | undefined) => {
    setValue(newValue);
    handleValueChange(newValue);
  };

  return (
    <Box>
      <Chip
        color={color || 'primary'}
        onDelete={() => {
          // Remove value when deleted
          handleValueChange(undefined);
          handleDelete && handleDelete(title);
        }}
        label={
          <Box display="flex" alignItems="center">
            {type === FilterChipInputTypes.DROPDOWN ? (
              <CssTextField
                select
                value={value || ''}
                label={title}
                onChange={(e) => handleChange(e.target.value)}
              >
                {selectValues?.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </CssTextField>
            ) : (
              <CssTextField
                label={title}
                value={value}
                inputProps={{ type: type }}
                onChange={(e) => handleChange(e.target.value)}
              ></CssTextField>
            )}
          </Box>
        }
      />
    </Box>
  );
};

export default FilterChip;
