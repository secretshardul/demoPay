#!/bin/bash
aws2 dynamodb batch-write-item \
    --request-items file://res/catalogItems.json