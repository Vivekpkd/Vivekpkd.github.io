# Python Tutorial

Python is one of the most popular programming languages in the world. It is simple to use,
packed with features, and supported by a wide range of libraries and frameworks.
Its clean syntax makes it beginner-friendly and highly readable.

- A **high-level language** used in data science, automation, AI, and web development.
- Known for its **readability** — code is easier to write, understand, and maintain.
- Backed by **strong library support** — we don't have to build everything from scratch.
- **Cross-platform** — works on Windows, Mac, and Linux without major changes.

---

## Getting Started

In this section we cover the basics — installing Python, writing your first program,
and understanding how Python code is structured.

```python
# Your first Python program
print("Hello, World!")
```

> Output: Hello, World!

- [Install Python](#)
- [Python Introduction](#)
- [Input and Output](#)
- [Comments in Python](#)

## Variables and Data Types

Variables store data values. Python is dynamically typed — no need to declare a type explicitly.

```python
# Variable examples
name = "Alice"
age = 25
pi = 3.14159
is_active = True

print(name, age, pi, is_active)
```

> Output: Alice 25 3.14159 True

### Numeric Types

Python supports `int`, `float`, and `complex` number types.

```python
x = 10        # int
y = 3.14      # float
z = 2 + 3j    # complex

print(type(x), type(y), type(z))
```

> Output: <class 'int'> <class 'float'> <class 'complex'>

### String Type

Strings are sequences of characters enclosed in single or double quotes.

```python
greeting = "Hello, Python!"
print(greeting.upper())
print(len(greeting))
```

> Output: HELLO, PYTHON!
> 14

- [Python Variables](#)
- [Python Data Types](#)
- [Type Casting](#)
- [Python Strings](#)

## Operators

Python supports arithmetic, comparison, logical, and assignment operators.

```python
a = 10
b = 3

print(a + b)   # Addition
print(a - b)   # Subtraction
print(a * b)   # Multiplication
print(a // b)  # Floor Division
print(a % b)   # Modulus
print(a ** b)  # Exponentiation
```

> Output: 13 7 30 3 1 1000

- [Arithmetic Operators](#)
- [Comparison Operators](#)
- [Logical Operators](#)
- [Bitwise Operators](#)

## Control Flow

### if / elif / else

Use conditional statements to control the flow of execution.

```python
score = 85

if score >= 90:
    print("Grade: A")
elif score >= 75:
    print("Grade: B")
else:
    print("Grade: C")
```

> Output: Grade: B

### Loops

Python has `for` and `while` loops for iteration.

```python
# for loop
for i in range(1, 6):
    print(i, end=" ")
```

> Output: 1 2 3 4 5

```python
# while loop
count = 0
while count < 3:
    print("Count:", count)
    count += 1
```

> Output: Count: 0
> Count: 1
> Count: 2

- [Conditional Statements](#)
- [for Loop](#)
- [while Loop](#)
- [break and continue](#)
- [List Comprehension](#)

## Functions

Functions let you group reusable code under a name. Use `def` to define a function.

```python
def greet(name, msg="Hello"):
    return f"{msg}, {name}!"

print(greet("Alice"))
print(greet("Bob", "Hi"))
```

> Output: Hello, Alice!
> Hi, Bob!

### Lambda Functions

A **lambda** is an anonymous, one-line function.

```python
square = lambda x: x ** 2
numbers = [1, 2, 3, 4, 5]
result = list(map(square, numbers))
print(result)
```

> Output: [1, 4, 9, 16, 25]

- [Defining Functions](#)
- [*args and **kwargs](#)
- [Lambda Functions](#)
- [Map, Filter, Reduce](#)
- [Decorators](#)
- [Recursion](#)

## Data Structures

Python provides powerful built-in data structures out of the box.

### Lists

Lists are **ordered** and **mutable** collections. They can hold mixed data types.

```python
fruits = ["apple", "banana", "cherry"]
fruits.append("mango")
print(fruits)
print(fruits[1])
```

> Output: ['apple', 'banana', 'cherry', 'mango']
> banana

### Tuples

Tuples are **ordered** and **immutable** — they cannot be changed after creation.

```python
point = (10, 20)
print(point[0], point[1])
```

> Output: 10 20

### Dictionaries

Dictionaries store **key-value pairs** for fast lookups.

```python
student = {"name": "Alice", "age": 22, "grade": "A"}
print(student["name"])
student["age"] = 23
print(student)
```

> Output: Alice
> {'name': 'Alice', 'age': 23, 'grade': 'A'}

### Sets

Sets are **unordered** collections of **unique** elements.

```python
s = {1, 2, 3, 2, 1}
print(s)
```

> Output: {1, 2, 3}

- [Lists](#)
- [Tuples](#)
- [Dictionaries](#)
- [Sets](#)
- [Arrays](#)
- [List Comprehension](#)

## OOP Concepts

Python is a fully object-oriented language. Everything in Python is an object.

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} makes a sound."

class Dog(Animal):
    def speak(self):
        return f"{self.name} says: Woof!"

dog = Dog("Rex")
print(dog.speak())
```

> Output: Rex says: Woof!

> Refer [Python OOP Guide](#) for the complete tutorial on classes, inheritance, and polymorphism.

- [Classes and Objects](#)
- [Inheritance](#)
- [Polymorphism](#)
- [Encapsulation](#)
- [Abstraction](#)
- [Iterators](#)

## Exception Handling

Exceptions are runtime errors. Python lets you handle them gracefully using `try / except`.

```python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Error: {e}")
finally:
    print("Execution complete.")
```

> Output: Error: division by zero
> Execution complete.

- [Exception Handling](#)
- [Built-in Exceptions](#)
- [Custom Exceptions](#)
- [try / except / finally](#)

## File Handling

Python can read from and write to files using the built-in `open()` function.

```python
# Write to a file
with open("hello.txt", "w") as f:
    f.write("Hello, File!")

# Read from a file
with open("hello.txt", "r") as f:
    print(f.read())
```

> Output: Hello, File!

- [File Handling](#)
- [Read Files](#)
- [Write / Create Files](#)
- [OS Module](#)
- [pathlib Module](#)

## Data Science

Python is the go-to language for data science and machine learning.

### Foundational Libraries

These libraries form the base for all data science work.

- [NumPy](#)
- [Pandas](#)
- [Matplotlib](#)

### Machine Learning Libraries

- [Scikit-learn](#)
- [XGBoost / LightGBM](#)

### Deep Learning Frameworks

- [TensorFlow and Keras](#)
- [PyTorch](#)

> Refer [Python for Data Science](#) for the complete tutorial.

## Web Development

Python has excellent frameworks for building web applications and REST APIs.

### Core Frameworks

- [Flask](#)
- [Django](#)

### API Development

- [Flask-RESTful](#)
- [Django REST Framework (DRF)](#)

> Refer [Python for Web Development](#) for the complete tutorial.

## Practice

Test your Python skills with quizzes and hands-on coding exercises.

- [Python Quizzes](#)
- [Coding Practice Problems](#)
- [Interview Questions](#)

> This tutorial is updated based on the latest **Python 3.13.1** version.
