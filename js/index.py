import re
string = "1233141 AUGSVNJKSBVUISHVUIHA"
print(re.sub(r"[A-Za-z]", "?", string, flags=re.IGNORECASE))