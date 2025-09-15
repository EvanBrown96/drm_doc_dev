# drm doc

drm doc is a tool for training rzp (aka drm) to dr solutions.

essentially [Tao Yu's trainer](https://tao-yu.github.io/Alg-Trainer/) but with features specifically for FMC

features:
- train on all common rzps (4c4e, 4c2e, 3c2e, 7c8e) as well as more obscure ones
- selectable maximum optimal case length for training, as well as trigger length bounds
- after training, displays all solutions less than a selected length
- reenqueue functionality for testing missed/hard cases again