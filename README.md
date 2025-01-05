# OOOly

https://oooly.io

A local-first web application for managing and planning your Paid Time Off (PTO). This tool helps you track your PTO balance, plan future time off, and manage accrual rates—all while keeping your data private in your browser's local storage.

## Features

### Time Off Management
- Track your current PTO balance
- Plan future time off with an intuitive interface
- Support for different day types (full day, half day, holidays)
- Automatic balance calculations based on planned time off

### Smart Accrual System
- Configure custom accrual rates
- Support for different pay period types (biweekly/semi-monthly)
- Automatic accrual date tracking
- Balance projections based on your accrual schedule

### Flexible Settings
- Customizable maximum balance caps
- Configurable year-end rollover limits
- Persistent settings stored locally in your browser
- Easy-to-use settings management interface

### Privacy-First Approach
- All data stored locally in your browser
- No server synchronization required
- Complete control over your PTO data
- Export/import functionality for data backup (coming soon)

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- No additional software installation required

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/mattkubota/OOOly.git
   ```
2. Navigate to the project directory:
   ```bash
   cd OOOly
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```

### Initial Setup
1. Open the application in your browser
2. Navigate to the Settings page
3. Enter your current PTO balance
4. Configure your accrual rate and pay period type
5. Set any maximum balance or rollover limits
6. Save your settings

## Usage

### Managing Settings
The settings page allows you to configure:
- Current PTO balance
- Accrual rate per pay period
- Pay period type (biweekly/semi-monthly)
- Maximum balance limits
- Year-end rollover restrictions
- Last accrual date

### Planning Time Off
1. Navigate to the dashboard
2. Click "Plan Time Off" to open the event creation form
3. Select your desired dates
4. Choose the day type (full day, half day, holiday)
5. Add any notes or descriptions
6. Submit to save your planned time off

### Viewing Your Dashboard
The dashboard provides at-a-glance information about:
- Current available balance
- Next accrual date and amount
- Upcoming planned time off
- Balance projections

## Technical Details

### Built With
- React - Frontend framework
- Tailwind CSS - Styling
- localStorage - Data persistence

### Project Structure
- Single-file component approach for simplicity
- React hooks for state management
- Nested component architecture
- Local storage for settings and events

## Coming Soon
- Advanced balance projections
- Holiday calendar integration
- Data export/import functionality

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## Technical Overview

[This section will contain a detailed technical overview of the project architecture, design decisions, and implementation details.]

Some areas that will be covered:
- Application Architecture
- State Management
- Data Flow
- Component Hierarchy
- Storage Implementation
- Performance Considerations
- Testing Strategy

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Inspired by the need for a simple, private PTO tracking solution
- Built with modern web technologies for reliability and ease of use
- Designed with user privacy in mind
