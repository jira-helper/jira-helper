# Git LFS Setup

This project uses Git LFS (Large File Storage) for storing binary files like visual test snapshots.

## Setup for Developers

### First-time setup

```bash
# Install Git LFS (if not already installed)
# Ubuntu/Debian:
sudo apt-get install git-lfs

# macOS:
brew install git-lfs

# Windows: Download from https://git-lfs.github.com/

# Initialize Git LFS in the repository
git lfs install
```

### Cloning the repository

When cloning the repository for the first time:

```bash
git clone <repository-url>
cd jira-helper
git lfs pull  # Download LFS files
```

Or use the built-in LFS support:

```bash
git clone <repository-url>
# Git LFS files will be downloaded automatically
```

## What's tracked by Git LFS

The following file patterns are tracked by Git LFS:

- `tests/visual/**/*.png` - Visual regression test snapshots

## Adding new files to Git LFS

To add new PNG files for visual testing:

```bash
# The files will be automatically tracked by the existing .gitattributes
git add tests/visual/new-snapshot.png
git commit -m "test: add visual snapshot"
```

If you need to track additional file types:

```bash
git lfs track "*.ext"  # e.g., git lfs track "*.jpg"
git add .gitattributes
git commit -m "chore: track *.ext with Git LFS"
```

## Common operations

### Check LFS status
```bash
git lfs status
git lfs ls-files
```

### Pull LFS files
```bash
git lfs pull
```

### Push LFS files
```bash
git lfs push origin main
```

### Migrate existing files to LFS
```bash
# Remove from Git
git rm --cached path/to/file.png

# Re-add through LFS
git add path/to/file.png
git commit -m "migrate: move file.png to Git LFS"
```

## Troubleshooting

### "git-lfs not found" error
Ensure Git LFS is installed and in your PATH.

### "Hook already exists" error
The project uses husky for Git hooks. The Git LFS hooks have been manually integrated. If you need to update hooks:

```bash
# Check existing hooks
cat .git/hooks/pre-push

# Manually add LFS commands if missing
```

### Large files still in Git history
If binary files were committed before Git LFS was set up:

```bash
# Use BFG Repo Cleaner or git filter-branch
# This is an advanced operation - consult the team first
```

## CI/CD considerations

CI systems need Git LFS installed. Example for GitHub Actions:

```yaml
steps:
  - uses: actions/checkout@v4
    with:
      lfs: true
```

## File size limits

- Git LFS files are stored separately from the main repository
- No practical size limit for individual files
- GitHub limits: 2GB per file, 5GB per repository for LFS