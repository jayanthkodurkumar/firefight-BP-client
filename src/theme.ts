import { createTheme } from '@mantine/core'
import { basePalette } from './theme/basePalette'

export const appTheme = createTheme({
  primaryColor: 'brand',
  defaultRadius: 'md',
  fontFamily:
    '"DM Sans", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  headings: {
    fontFamily:
      '"DM Sans", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    fontWeight: '600',
  },
  colors: {
    brand: [
      basePalette.green5,
      basePalette.green20,
      '#9ecf6a',
      basePalette.green60,
      '#5f9348',
      '#3d7235',
      basePalette.green90,
      '#193d24',
      basePalette.green100,
      '#08160c',
    ],
    dark: [
      basePalette.grey5,
      basePalette.grey20,
      basePalette.grey40,
      basePalette.grey60,
      basePalette.grey80,
      basePalette.grey100,
      '#1f1e1c',
      '#1a1918',
      '#141312',
      '#0e0d0c',
    ],
  },
  white: basePalette.white,
  black: basePalette.grey100,
  components: {
    AppShell: {
      styles: {
        navbar: {
          backgroundColor: basePalette.white,
          borderRight: `1px solid ${basePalette.grey20}`,
        },
        header: {
          backgroundColor: basePalette.white,
          borderBottom: `1px solid ${basePalette.grey20}`,
        },
        main: {
          backgroundColor: basePalette.grey5,
        },
      },
    },
    Paper: {
      defaultProps: {
        shadow: 'xs',
        radius: 'md',
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: basePalette.grey20,
          backgroundColor: basePalette.white,
        },
      },
    },
    Button: {
      defaultProps: {
        color: 'brand',
      },
    },
    Table: {
      styles: {
        table: {
          backgroundColor: basePalette.white,
        },
      },
    },
    NavLink: {
      styles: {
        root: {
          color: basePalette.grey100,
        },
        label: {
          fontWeight: 500,
        },
      },
    },
  },
})
