#!/bin/bash
sed -i 's/export function BlueTower({ user, onBack }: any)/export function BlueTower({ user, onBack, deviceMode }: any)/g' src/BlueTower.tsx
