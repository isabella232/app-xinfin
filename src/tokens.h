#ifndef _TOKENS_H_
#define _TOKENS_H_

#include <stdint.h>

typedef struct tokenDefinition_t {
    uint8_t address[20];
    uint8_t ticker[12]; // 10 characters + ' \0'
    uint8_t decimals;
} tokenDefinition_t;

#endif /* _TOKENS_H_ */