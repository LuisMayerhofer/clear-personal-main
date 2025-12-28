# Check R version
required_r_version <- "4.4.1"
current_r_version <- getRversion()

if (current_r_version < required_r_version) {
  stop(sprintf(
    "This script requires R version %s or higher. You are running R version %s.\nPlease update R from https://cran.r-project.org/",
    required_r_version,
    current_r_version
  ))
}

# Function to check and install packages
install_if_missing <- function(package) {
  if (!require(package, character.only = TRUE)) {
    install.packages(package, repos = "https://cloud.r-project.org")
  }
}

# Install required packages
required_packages <- c(
  "devtools",
  "mlr",
  "mlrCPO",
  "ggplot2",
  "iml",
  "partykit",
  "parallelMap",
  "ada",
  "ipred",
  "evd"
)

# Install all required packages
for (package in required_packages) {
  install_if_missing(package)
}

# Install mosmafs from archive
mosmafs_url <- "https://cran.r-project.org/src/contrib/Archive/mosmafs/mosmafs_0.1.2.tar.gz"
mosmafs_file <- "mosmafs_0.1.2.tar.gz"

if (!require("mosmafs", character.only = TRUE)) {
  download.file(url = mosmafs_url, destfile = mosmafs_file)
  install.packages(pkgs = mosmafs_file, type = "source", repos = NULL)
  unlink(mosmafs_file)
}

# Install counterfactuals package from local directory
if (!require("counterfactuals", character.only = TRUE)) {
  devtools::install("../r-server/counterfactuals/")
}


cat("Setup completed successfully!\n") 