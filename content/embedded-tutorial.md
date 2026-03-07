# Embedded Systems Tutorial

Embedded systems are specialized computing systems that perform dedicated functions within larger mechanical or electrical systems. They are the brains behind everything from microcontrollers in appliances to real-time systems in automotive applications.

- **Ubiquitous** — Found in smartphones, IoT devices, automobiles, medical equipment, and industrial systems.
- **Real-time Processing** — Must meet strict timing constraints and reliability requirements.
- **Resource-Constrained** — Limited memory, power, and processing capabilities compared to general-purpose computers.
- **Physical Interaction** — Directly interface with hardware through sensors, actuators, and communication protocols.

---

## Getting Started with Embedded Systems

Embedded systems form the foundation of modern electronics. This section covers the basics of embedded computing, hardware interaction, and development environments.

```c
// Your first embedded program - LED blink
#include <avr/io.h>
#include <util/delay.h>

int main(void) {
    DDRB = 0b00100000;  // Set PB5 as output
    
    while(1) {
        PORTB ^= 0b00100000;  // Toggle PB5
        _delay_ms(1000);       // Wait 1 second
    }
    
    return 0;
}
```

> Output: LED blinks every 1 second

- [Microcontroller Basics](#)
- [AVR vs ARM vs STM32](#)
- [Development Tools Setup](#)
- [First Program Walkthrough](#)

## Microcontroller Architecture

Microcontrollers (MCUs) are the heart of embedded systems. Understanding their architecture is crucial for effective embedded programming.

```c
// Reading analog sensor value
#include <avr/io.h>

uint16_t read_adc(uint8_t channel) {
    ADMUX = (ADMUX & 0xF0) | (channel & 0x0F);
    ADCSRA |= (1 << ADSC);
    
    while(ADCSRA & (1 << ADSC));
    
    return ADC;
}

int main(void) {
    DDRC = 0x00;  // PORTC as input for ADC
    
    while(1) {
        uint16_t sensor_value = read_adc(0);
        // Process sensor_value
    }
}
```

> Output: ADC value read from channel 0

### CPU Core

The CPU executes instructions from memory and performs calculations. Most embedded systems use:

```c
// Memory organization example
volatile uint8_t register_a;      // SRAM
const int rom_value = 1024;       // Flash/ROM
static int static_var = 0;        // SRAM (initialized)

void cpu_operation() {
    register_a = rom_value;       // Copy from ROM to SRAM
    static_var++;                 // Increment in SRAM
}
```

### Memory Hierarchy

Embedded systems typically have three types of memory:

```c
// Memory types and usage
int global_array[100];            // SRAM - global storage
const char* strings[] = {         // Flash - constant strings
    "Hello",
    "Embedded",
    "World"
};

void memory_demo() {
    static int counter = 0;       // Flash-initialized SRAM
    counter++;
}
```

- Flash Memory (Program Storage)
- SRAM (Runtime Variables)
- EEPROM (Non-volatile Data Storage)

## GPIO and Digital I/O

General Purpose Input/Output (GPIO) pins are how microcontrollers interact with the physical world. They can be configured as inputs or outputs.

```c
// GPIO configuration and control
#include <avr/io.h>

#define LED_PIN     5
#define BUTTON_PIN  2

void gpio_init() {
    DDRB |= (1 << LED_PIN);      // LED as output
    DDRD &= ~(1 << BUTTON_PIN);  // Button as input
    PORTD |= (1 << BUTTON_PIN);  // Enable pull-up
}

void check_button() {
    if((PIND & (1 << BUTTON_PIN)) == 0) {
        PORTB |= (1 << LED_PIN);  // Turn LED ON
    } else {
        PORTB &= ~(1 << LED_PIN); // Turn LED OFF
    }
}

int main(void) {
    gpio_init();
    while(1) {
        check_button();
    }
}
```

> Output: LED responds to button press

### Digital Outputs

```c
// Multiple output control
void control_outputs() {
    DDRB = 0xFF;        // All PORTB pins as outputs
    PORTB = 0x0F;       // Set lower 4 bits HIGH
    PORTB ^= 0xFF;      // Toggle all bits
}
```

### Digital Inputs

```c
// Reading digital inputs with debouncing
uint8_t debounce_read(volatile uint8_t *port, uint8_t pin) {
    uint8_t state_count = 0;
    
    for(int i = 0; i < 3; i++) {
        if((*port & (1 << pin)) == 0) {
            state_count++;
        }
        _delay_ms(5);
    }
    
    return (state_count >= 2) ? 1 : 0;
}
```

## Interrupts and External Events

Interrupts allow microcontrollers to respond to events without continuously polling. They're essential for real-time embedded systems.

```c
// External interrupt handling
#include <avr/interrupt.h>

volatile uint8_t button_pressed = 0;

ISR(INT0_vect) {
    button_pressed = 1;
}

void interrupt_init() {
    EICRA |= (1 << ISC01);  // Falling edge trigger
    EIMSK |= (1 << INT0);   // Enable INT0
    sei();                   // Enable global interrupts
}

int main(void) {
    interrupt_init();
    
    while(1) {
        if(button_pressed) {
            // Handle button event
            button_pressed = 0;
        }
    }
}
```

> Output: Interrupt triggered on external event

## Timers and PWM

Timers are used for precise timing, pulse generation, and PWM (Pulse Width Modulation) control.

```c
// Timer0 setup for PWM
#include <avr/io.h>

void pwm_init() {
    DDRD |= (1 << PD6);       // OC0A as output
    TCCR0A = 0b11000011;      // PWM mode, set on compare
    TCCR0B = 0b00000001;      // Prescaler 1
    OCR0A = 127;              // 50% duty cycle
}

void set_pwm_duty(uint8_t duty) {
    OCR0A = duty;  // 0-255 maps to 0-100%
}

int main(void) {
    pwm_init();
    
    while(1) {
        for(uint8_t i = 0; i < 255; i++) {
            set_pwm_duty(i);
            _delay_ms(10);
        }
    }
}
```

> Output: PWM signal with varying duty cycle

### Timer Interrupts

```c
// Timer overflow interrupt
ISR(TIMER0_OVF_vect) {
    // Executed every timer overflow
    static uint8_t counter = 0;
    counter++;
}

void timer_overflow_init() {
    TCCR0B = 0b00000101;      // Prescaler 1024
    TIMSK0 |= (1 << TOIE0);   // Enable overflow interrupt
    sei();
}
```

## Serial Communication (UART)

UART (Universal Asynchronous Receiver-Transmitter) is one of the most common communication protocols in embedded systems.

```c
// UART initialization and communication
#include <avr/io.h>

#define BAUD 9600
#define F_CPU 16000000UL
#define UBRR_VALUE ((F_CPU / (16UL * BAUD)) - 1)

void uart_init() {
    UBRR0H = (UBRR_VALUE >> 8);
    UBRR0L = (UBRR_VALUE & 0xFF);
    UCSR0B = (1 << RXEN0) | (1 << TXEN0);
    UCSR0C = (1 << UCSZ01) | (1 << UCSZ00);
}

void uart_transmit(uint8_t data) {
    while(!(UCSR0A & (1 << UDRE0)));
    UDR0 = data;
}

uint8_t uart_receive() {
    while(!(UCSR0A & (1 << RXC0)));
    return UDR0;
}

int main(void) {
    uart_init();
    
    while(1) {
        uint8_t received = uart_receive();
        uart_transmit(received);  // Echo received data
    }
}
```

> Output: Data echoed back through UART

## Analog-to-Digital Conversion (ADC)

ADC converts analog signals from sensors into digital values that the microcontroller can process.

```c
// ADC configuration for temperature sensor
#include <avr/io.h>

void adc_init() {
    ADMUX = 0b01000000;        // AVCC reference, ADC0 channel
    ADCSRA = 0b10000110;       // Enable ADC, prescaler 64
}

uint16_t adc_read() {
    ADCSRA |= (1 << ADSC);     // Start conversion
    while(ADCSRA & (1 << ADSC));
    return ADC;
}

int main(void) {
    adc_init();
    
    while(1) {
        uint16_t analog_val = adc_read();
        int temperature = (analog_val * 5 / 1024);
        // Process temperature reading
    }
}
```

> Output: Temperature value in digital format

## Memory Management

Efficient memory management is critical in resource-constrained embedded systems.

```c
// Static vs Dynamic memory
#include <stdlib.h>

// Static allocation - fixed at compile time
uint8_t buffer[256];

// Dynamic allocation - runtime flexibility
void* allocate_buffer(size_t size) {
    return malloc(size);
}

void init_system() {
    // Prefer static allocation when possible
    static int system_state = 0;
    
    // Use dynamic allocation sparingly
    uint8_t* temp_buffer = malloc(128);
}
```

## Real-Time Operating Systems (RTOS)

Many embedded systems use RTOS for multitasking and scheduling.

```c
// FreeRTOS example
#include <FreeRTOS.h>
#include <task.h>

void task_led(void *pvParameters) {
    while(1) {
        toggle_led();
        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
}

void task_sensor(void *pvParameters) {
    while(1) {
        read_sensor();
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}

int main(void) {
    xTaskCreate(task_led, "LED", 256, NULL, 1, NULL);
    xTaskCreate(task_sensor, "Sensor", 256, NULL, 1, NULL);
    
    vTaskStartScheduler();
    return 0;
}
```

> Output: Multiple tasks running concurrently

## Debugging Embedded Systems

Debugging embedded systems requires specialized tools and techniques.

```c
// Debug macro for logging
#define DEBUG_PRINT(fmt, ...) \
    uart_printf("DEBUG: " fmt "\r\n", ##__VA_ARGS__)

void debug_system_state() {
    static uint16_t debug_counter = 0;
    
    if(debug_counter++ % 1000 == 0) {
        DEBUG_PRINT("System uptime: %lu ms", get_uptime());
    }
}

void uart_printf(const char *fmt, ...) {
    // Implementation for formatted UART output
}
```

## Power Management

Embedded systems often run on batteries, making power efficiency crucial.

```c
// Sleep mode implementation
#include <avr/sleep.h>

void enter_sleep_mode() {
    set_sleep_mode(SLEEP_MODE_PWR_DOWN);
    sleep_enable();
    sei();
    sleep_cpu();
    sleep_disable();
}

void power_efficient_loop() {
    while(1) {
        if(no_work_to_do()) {
            enter_sleep_mode();
        }
    }
}
```

## Performance Optimization

```c
// Inline functions for performance-critical code
static inline void fast_operation() {
    // Critical operation - avoid function call overhead
}

// Bit manipulation for efficiency
#define SET_BIT(port, bit)   ((port) |= (1 << (bit)))
#define CLR_BIT(port, bit)   ((port) &= ~(1 << (bit)))
#define TOG_BIT(port, bit)   ((port) ^= (1 << (bit)))

void optimized_routine() {
    SET_BIT(PORTB, 5);  // More efficient than PORTB |= (1 << 5)
}
```

## Common Pitfalls and Best Practices

Common mistakes in embedded development:

- Not using `volatile` for hardware registers
- Ignoring interrupt priorities
- Buffer overflows in limited memory
- Not planning for scalability
- Poor code documentation

```c
// Best practice examples
volatile uint8_t sensor_flag = 0;  // Hardware register

ISR(INT0_vect) __attribute__((interrupt)) {
    sensor_flag = 1;
}

void safe_buffer_operation(const char *data, size_t max_len) {
    // Boundary checking
    if(strlen(data) >= max_len) {
        // Handle error
        return;
    }
}
```

## Practice Projects

Test your embedded systems knowledge with these projects:

- [LED Blink Tutorial](#)
- [Button Debouncing](#)
- [Temperature Sensor Reading](#)
- [PWM LED Control](#)
- [Multi-tasking with RTOS](#)
- [Simple Robot Controller](#)
- [Embedded Data Logging](#)
- [IoT Sensor Node](#)

## Advanced Topics

For experienced developers, explore:

- [Device Drivers](#)
- [Hardware Abstraction Layers (HAL)](#)
- [Bootloaders](#)
- [Firmware Updates](#)
- [Security in Embedded Systems](#)
- [Real-time Constraints](#)
- [Low-Power Design](#)
