# Tasks to work on

- When selecting a task for development always create an implementation planning document in `docs/plans` with a filename matching the task
- Do not work on the implementation plan until the user has approved it
- When a task has been completed, make sure that the relevant items here are checked off
- When completing a task, add a completion timestamp (format Y-m-d h:m) to the relevant task here

## 1 - Realistic Dice
- [x] 1.1 - Chamfered edges (2026-02-10 20:32)
- [x] 1.2 - Reduce the metallic sheen of the dice to make them look more plastic (2026-02-10 20:44)
- [x] 1.3 - Update the dice colours as follows (2026-02-10 20:38):
  - Dark mode: Face #060c23, Symbols #dee1ed
  - Light mode: Face #dee1ed, Symbols #060c23

## 2 - Toasts
- [x] 2.1 - Change the toast appearance to (2026-02-10 21:29):
  - Border radius - 5px
  - Dark background - #333333
  - White text: #FEFEFE
  - Remove the left hand border accent
- [x] 2.2 - For alert toasts only (those with just an 'Ok' button) (2026-02-10 21:29)
  - Move the toast about 2rem from the viewport bottom and 1rem in from the right hand side
  - On mobile (less than 450px width) make the toast full width, minus 1rem on either side
- [x] 2.3 - Implement an alternative alert toast which vanishes after a specified timeout. (2026-02-11 19:50)
  - The toast should have a coloured progress bar at the bottom which fills up as the timeout approaches
  - The progress bar should be thin and red

## 3 - Cards
- [x] 3.1 - When width <=450px, card width should be 100% (2026-02-10 21:42)
- [x] 3.2 - For the Skills element, allow clicking the skill rating (+4, +3, etc) to roll the dice, automatically adding the skill rating to the end result. (2026-02-11 20:02)

## 4 - Navigation
- [ ] 4.1 - The dark mode toggle shouldn't be absorbed into the hamburger menu
  - The icon should be larger - 24x24px
  - The icon should stay on the left hand end of the header bar
  - It should move right to allow the hamburger menu trigger to fit to the left of it when it shows
- [ ] 4.2 - Update the styling of the navigation items in the hamburger menu
  - They should be right aligned
  - The font size should be 1.5rem
  - The padding should be 0.5rem, 1rem
  - The icons should be 32px square
  - There should be a 0.5rem right margin on the action icons
