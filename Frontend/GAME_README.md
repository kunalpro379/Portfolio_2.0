# Equation Master Game 🎮

A professional mathematical equation game with a clean white design. Guide falling balls through mathematical curves to collect stars across 5 progressive levels!

## 🎯 Features

### Core Gameplay
- **5 Progressive Levels**: Each level increases difficulty with more stars (Level 1: 5 stars → Level 5: 15 stars)
- **Level Progression**: Complete all stars to unlock the next level (max 5 levels)
- **Physics-Based Ball Movement**: Realistic gravity, collision, and bounce mechanics
- **Multiple Equation Types**:
  - **y = f(x)**: Standard functions like `sin(x)`, `x^2`, etc.
  - **x = f(y)**: Inverse functions
  - **Parametric (t)**: Curves like circles and spirals using `(x(t), y(t))`

### Professional UI
- **Navigation Bar**: Integrated navbar from landing page with HOME, EXPERIENCE, PROJECTS, LEARNINGS, GAME links
- **Clean White Sidebar**: Professional scrollable sidebar with all controls
- **Responsive Design**: Works on desktop and mobile devices
- **Smooth Animations**: Polished transitions and hover effects

### Advanced Features
- **Real-time Equation Editing**: Modify equations on the fly
- **Interactive Graph Canvas**:
  - Pan by dragging
  - Zoom with mouse wheel
  - Shift+click to set ball drop point
- **Visual Feedback**:
  - Glowing curves with shadows
  - Animated ball trails
  - Golden star collectibles
  - Smooth gradient balls with highlights

### Mathematical Capabilities
- **Supported Functions**: `sin`, `cos`, `tan`, `log`, `sqrt`, `abs`, `exp`
- **Operators**: `+`, `-`, `*`, `/`, `^` (power)
- **Constants**: `pi`, `e`
- **Complex Expressions**: Handles any valid mathematical expression
- **Variables**: `x`, `y`, `t` for different equation types

## 🎨 Design Theme
- **Background**: Clean white (#FFFFFF)
- **Sidebar**: White with subtle borders
- **Grid**: Light gray (#F5F5F5) with darker major grid (#E5E5E5)
- **Axes**: Black (#000000) for clarity
- **Curves**: Colorful (Brown, Sienna, Chocolate, Peru, Burlywood, Wheat)
- **Stars**: Gold (#FFD700) with glow effects
- **Balls**: White to gray gradient with shine highlights

## 🎮 How to Play

1. **Add Equations**: Use the sidebar to add mathematical equations
   - Choose equation type (y=, x=, or parametric)
   - Enter your expression
   - Or click example equations for quick start

2. **Position Drop Point**: 
   - Shift+click on the graph to set where balls drop from
   - Or drag the existing drop point marker

3. **Drop Balls**: Click "Drop Balls" to release 5 balls
   - Balls fall with gravity
   - They bounce off your equation curves
   - Guide them to collect all stars

4. **Level Up**: Collect all stars to unlock the next level
   - 5 levels total
   - Each level adds more stars
   - Requires more complex equation strategies

## 📐 Example Equations

### Easy (Level 1-2)
- `y = -0.2*x^2 + 4` - Simple parabola
- `y = sin(x)` - Sine wave
- `y = -0.5*x + 2` - Linear slope

### Medium (Level 3)
- `y = 2*cos(x)` - Cosine wave
- `x = 3*sin(y)` - Vertical sine
- `y = x^3/10` - Cubic curve

### Advanced (Level 4-5)
- `4*cos(t), 4*sin(t)` - Circle (parametric)
- `t*cos(t), t*sin(t)` - Spiral (parametric)
- `sin(x) + 0.2*x^2` - Combined functions

## 🛠️ Technical Stack
- **React** with TypeScript
- **TanStack Router** for routing
- **mathjs** for equation parsing and evaluation
- **Canvas API** for high-performance rendering
- **Custom Physics Engine** for realistic ball movement
- **Tailwind CSS** for styling

## 🚀 Access
Navigate to `/game` route in your browser to play!

## 🎯 Tips & Strategies
1. **Use Multiple Curves**: Combine different equations to create paths
2. **Angle Matters**: Adjust curve slopes to guide balls precisely
3. **Parametric Power**: Use circles and spirals for complex paths
4. **Toggle Curves**: Disable equations you don't need
5. **Experiment**: Try different mathematical combinations!
6. **Level Progression**: Each level requires more strategic thinking

## 📱 Controls
- **Mouse Drag**: Pan the graph view
- **Mouse Wheel**: Zoom in/out
- **Shift + Click**: Set ball drop point
- **Sidebar**: Add, edit, toggle, and remove equations

---

**Master the equations and conquer all 5 levels! 🎓✨**
