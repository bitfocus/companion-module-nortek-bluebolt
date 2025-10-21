# Variable Support Changes

## Overview

This module has been updated to support Companion variables in action and feedback fields, as requested in the feature issue.

## Changes Made

### 1. Upgraded @companion-module/base

- **From:** ~1.0.2
- **To:** ~1.13.4

This upgrade provides the necessary API support for the `useVariables` option.

### 2. Config Fields

Added variable support to the following configuration fields:

- **Device IP (host):** Can now use variables for dynamic IP addresses
- **Device ID:** Can now use variables for dynamic device IDs

### 3. Action Fields

Converted all number input fields to text input fields with variable support:

#### Bank Selection Fields
- UDP Power Action
- UDP Set Delay
- UDP Enable Trigger
- Telnet Bank Power Action
- Telnet Set Trigger Source
- Telnet Set Delay

#### Delay Value Fields
- UDP Set Bank Delay
- Telnet Set Reboot Delay (Button 1 and Button 2)
- Telnet Set Delay (On and Off delays)

#### Other Fields
- UDP Set Brightness (values 1-5)

### 4. Feedback Fields

- **Bank Power Status:** Bank selection now supports variables

## Usage Examples

### Using Static Values (Backward Compatible)

Actions continue to work exactly as before:
- Bank: `1`
- Delay: `500`
- Brightness: `3`

### Using Variables

You can now use Companion variables in these fields:

- Bank: `$(internal:custom_bank_number)`
- Delay: `$(custom:my_delay_value)`
- Brightness: `$(internal:brightness_level)`

### Using Expressions

Companion variable expressions are also supported:
- `$(=1+2)` evaluates to `3`
- `$(=custom:base_bank + 1)` adds 1 to a custom variable

## Technical Notes

### Field Conversion

Number fields were converted to text input fields to enable variable support:
- Type changed from `"number"` to `"textinput"`
- Min/max/step properties replaced with regex validation
- Default values changed from numbers to strings (e.g., `1` → `"1"`)
- `useVariables: true` added to enable the variable picker UI

### Validation

All converted fields include appropriate regex validation:
- General numbers: `/^\d+$/` (matches one or more digits)
- Brightness: `/^[1-5]$/` (matches single digit 1-5)

### Backward Compatibility

All changes are backward compatible:
- Existing configurations will continue to work
- Numeric values are automatically treated as strings
- XML command generation works identically with string values

## Benefits

Users can now:
1. Use custom variables to control device parameters dynamically
2. Create more flexible and reusable button configurations
3. Update multiple actions simultaneously by changing a single variable
4. Build more complex automation logic using variable expressions
