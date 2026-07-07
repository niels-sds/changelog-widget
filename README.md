# Changelog Widget

Embeddable in-app release notes widget powered by SCOR Design System components. Display curated release notes and changelog information directly within your application with zero dependencies and seamless design system integration.

## Features

- **Embeddable via Script Tag** – Single line of HTML to integrate release notes into any app
- **Powered by SCOR Design System** – Built entirely with `sds-*` components for consistent styling
- **Zero Dependencies** – Lightweight standalone component
- **Audience Badges** – Highlight release notes relevant to specific user segments
- **Scrollable Release List** – Browse through releases with smooth scrolling UX
- **Responsive Design** – Works across all device sizes
- **Theme Support** – Light and dark theme variants
- **Accessible** – Full WCAG compliance and keyboard navigation support

## Usage

### Basic Embed

Add the changelog widget to your application with a single script tag:

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Load SCOR Design System -->
    <link rel="stylesheet" href="https://cdn.example.com/sds/main.css" />
    <script src="https://cdn.example.com/sds/main.js"></script>
    
    <!-- Load Changelog Widget -->
    <script src="https://cdn.example.com/changelog-widget/changelog-widget.js"></script>
  </head>
  <body>
    <!-- Embed the widget -->
    <changelog-widget theme="light" app="my-app"></changelog-widget>
  </body>
</html>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `theme` | string | `light` | Theme variant: `light` or `dark` |
| `app` | string | required | Application identifier to fetch relevant releases |

## Example

```html
<div style="width: 400px; height: 600px;">
  <changelog-widget theme="dark" app="portal-app"></changelog-widget>
</div>
```

## Future Enhancements

- **Nebula API Integration** – Automatically fetch releases from Nebula release management platform
- **Read State Persistence** – Remember which releases users have viewed
- **CDN Hosting** – Distribute widget and assets via global CDN for optimal performance
- **Custom Styling** – CSS variable overrides for theme customization
- **Search and Filtering** – Built-in search across releases by title and content
- **Notification Bell** – Alert icon for new releases

## License

This project is part of SCOR Digital Solutions' design system initiative.
